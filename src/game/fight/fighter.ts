/**
 * Fighter entity class
 */

import {
  type CharacterDefinition,
  DEFAULT_MOVEMENT_PROFILE,
  createCharacterAttack,
  getCharacterNormalChainLength,
} from '@/content/characters/character-data';
import type { SpecialMoveDefinition } from '@/content/specials';
import { calculateLaneTransition, getLaneY } from '@/game/physics/lanes';
import {
  type FighterSpecialState,
  createDefaultSpecialState,
  tickFighterSpecialState,
} from '@/game/specials/runtime-state';
import type { ActiveStatusEffect } from '@/game/specials/status-effects';
import { sign } from '@/utils/math';
import {
  type AttackMotionVariation,
  type AttackPresentationProfile,
  type FightCameraEffect,
  createAttackMotionVariation,
  createPresentationCameraEffect,
  createPresentationVisualEffect,
  resolveAttackPresentationProfile,
} from './attack-presentation-presets';
import { createSpecialAttack } from './combat-intent';
import { type ComboState, createComboState } from './combo';
import { applyFighterMotor } from './fighter-motor';
import {
  type AttackData,
  type Direction,
  FRAME_DATA,
  type FighterStateName,
  type FighterStats,
  type Lane,
  STATE_TRANSITIONS,
} from './fighter-state';
import { canRegisterAttackContact, registerAttackContact } from './hit-confirm';
import type { ActiveHitbox } from './hitbox';
import { DEFAULT_HURTBOX, createActiveHitbox } from './hitbox';
import type { FightVisualEffect } from './visual-effects';

/**
 * Fighter class
 */
export class Fighter {
  // Identity
  readonly id: string;
  readonly characterId: string;
  readonly playerId: 1 | 2;

  // Position
  x: number;
  y: number;
  lane: Lane;

  // Movement
  velocityX = 0;
  velocityY = 0;
  moveVelocityX = 0;
  facing: Direction;

  // State
  state: FighterStateName = 'idle';
  stateFrame = 0;
  stateTimer = 0;

  // Stats
  stats: FighterStats;
  movement = DEFAULT_MOVEMENT_PROFILE;

  // Combat
  health: number;
  isBlocking = false;
  blockStartedFrame = 0;
  hitstunFrames = 0;
  blockstunFrames = 0;
  invulnerableFrames = 0;

  // Attack
  currentAttack: AttackData | null = null;
  attackFrame = 0;
  attackChainIndex = 0;
  attackChainTimeout = 0;

  // Special
  specialCooldown = 0;
  specialMaxCooldown = 300;
  specialState: FighterSpecialState;
  pendingSpecialSpawns: SpecialMoveDefinition[] = [];
  statusEffects: ActiveStatusEffect[] = [];

  // Combo
  combo: ComboState;

  // Movement flags
  isGrounded = true;
  isRunning = false;
  runTapTime = Number.NEGATIVE_INFINITY;
  lastDirection: Direction | null = null;
  previousHorizontalInput = 0;
  previousVerticalInput = 0;

  // Lane change
  laneChangeTimer = 0;
  laneChangeStartLane: Lane;
  targetLane: Lane = 1;

  // Attack facing lock
  attackFacing: Direction | null = null;
  attackContacts = new Map<string, { hits: number; lastHitFrame: number }>();
  currentAttackPresentation: AttackPresentationProfile | null = null;
  attackMotionVariation: AttackMotionVariation = {
    startupShift: 0,
    activeShift: 0,
    recoveryShift: 0,
    reachJitter: 0,
    leanJitter: 0,
    twistJitter: 0,
    cadenceJitter: 0,
  };
  attackPresentationCueIndex = 0;
  attackVariationCounter = 0;
  pendingPresentationEffects: FightVisualEffect[] = [];
  pendingCameraEffects: FightCameraEffect[] = [];

  // Animation / view state
  animationFrame = 0;
  externalVelocityDecay = 0.95;
  landingFrames = 0;
  turnaroundFrames = 0;
  turnaroundFrom: Direction | null = null;
  recoilFrames = 0;
  recoilDirection = 0;
  pendingKnockdown = false;

  readonly character: CharacterDefinition;

  constructor(
    id: string,
    characterId: string,
    playerId: 1 | 2,
    character: CharacterDefinition,
    startX: number,
    startLane: Lane = 1
  ) {
    this.id = id;
    this.character = character;
    this.characterId = characterId;
    this.playerId = playerId;

    this.x = startX;
    this.y = 0; // Y offset from ground, 0 = grounded
    this.lane = startLane;
    this.targetLane = startLane;
    this.laneChangeStartLane = startLane;

    this.facing = playerId === 1 ? 'right' : 'left';

    this.stats = { ...character.baseStats };

    this.health = this.stats.maxHealth;
    this.movement = { ...DEFAULT_MOVEMENT_PROFILE, ...character.movement };
    this.combo = createComboState();
    this.specialMaxCooldown = character.special.cooldown;
    this.specialState = createDefaultSpecialState(characterId as never, this.stats.energy);
  }

  /**
   * Get the ground Y position for this lane
   */
  getGroundY(): number {
    if (this.laneChangeTimer > 0 && this.laneChangeStartLane !== this.targetLane) {
      const progress = 1 - this.laneChangeTimer / FRAME_DATA.LANE_CHANGE_DURATION;
      return calculateLaneTransition(this.laneChangeStartLane, this.targetLane, progress);
    }

    return getLaneY(this.lane);
  }

  /**
   * Get the world Y position (including jump height)
   */
  getWorldY(): number {
    return this.getGroundY() - this.y;
  }

  /**
   * Check if can transition to a state
   */
  canTransitionTo(state: FighterStateName): boolean {
    const allowed = STATE_TRANSITIONS[this.state];
    return allowed?.includes(state) ?? false;
  }

  /**
   * Transition to a new state
   */
  setState(state: FighterStateName): boolean {
    if (!this.canTransitionTo(state)) {
      return false;
    }
    this.state = state;
    this.stateFrame = 0;
    this.stateTimer = 0;
    return true;
  }

  forceState(state: FighterStateName): void {
    this.state = state;
    this.stateFrame = 0;
    this.stateTimer = 0;
  }

  setFacing(direction: Direction): void {
    if (this.facing === direction) {
      return;
    }

    this.turnaroundFrom = this.facing;
    this.turnaroundFrames = FRAME_DATA.TURNAROUND_DURATION;
    this.facing = direction;
  }

  triggerLanding(impact = 1): void {
    const duration = Math.max(
      1,
      Math.round(FRAME_DATA.LANDING_IMPACT_DURATION * Math.max(0.5, Math.min(1.6, impact)))
    );
    this.landingFrames = Math.max(this.landingFrames, duration);
  }

  triggerRecoil(direction: number, strength = 1): void {
    const fallbackDirection = this.facing === 'right' ? -1 : 1;
    this.recoilDirection = sign(direction) || fallbackDirection;
    const duration = Math.max(
      1,
      Math.round(FRAME_DATA.RECOIL_DURATION * Math.max(0.4, Math.min(1.5, strength)))
    );
    this.recoilFrames = Math.max(this.recoilFrames, duration);
  }

  private applyAgilityToFrames(baseFrames: number): number {
    const modifier = 1 - Math.min(0.4, this.stats.agility * 0.02);
    return Math.max(1, Math.floor(baseFrames * modifier));
  }

  private applyStatFrameScaling(attack: AttackData): AttackData {
    return {
      ...attack,
      startup: this.applyAgilityToFrames(attack.startup),
      recovery: this.applyAgilityToFrames(attack.recovery),
    };
  }

  private resetAttackPresentation(): void {
    this.currentAttackPresentation = null;
    this.attackPresentationCueIndex = 0;
    this.attackMotionVariation = {
      startupShift: 0,
      activeShift: 0,
      recoveryShift: 0,
      reachJitter: 0,
      leanJitter: 0,
      twistJitter: 0,
      cadenceJitter: 0,
    };
  }

  private configureAttackPresentation(attack: AttackData): void {
    this.currentAttackPresentation = resolveAttackPresentationProfile(attack);
    this.attackMotionVariation = createAttackMotionVariation(
      attack,
      this.character.animation.visualSeed,
      ++this.attackVariationCounter
    );
    this.attackPresentationCueIndex = 0;
  }

  private queuePresentationCues(
    previousFrame: number,
    nextFrame: number,
    currentFrame: number
  ): void {
    if (!this.currentAttack || !this.currentAttackPresentation) {
      return;
    }

    const cues = this.currentAttackPresentation.cues;
    while (this.attackPresentationCueIndex < cues.length) {
      const cue = cues[this.attackPresentationCueIndex];
      if (!cue || cue.frame > nextFrame) {
        break;
      }
      if (cue.frame > previousFrame) {
        const effect = createPresentationVisualEffect(this, this.currentAttack, cue, currentFrame);
        const cameraEffect = createPresentationCameraEffect(this, cue, currentFrame);
        if (effect) {
          this.pendingPresentationEffects.push(effect);
        }
        if (cameraEffect) {
          this.pendingCameraEffects.push(cameraEffect);
        }
      }
      this.attackPresentationCueIndex++;
    }
  }

  drainPresentationEffects(): FightVisualEffect[] {
    const effects = [...this.pendingPresentationEffects];
    this.pendingPresentationEffects.length = 0;
    return effects;
  }

  drainCameraEffects(): FightCameraEffect[] {
    const effects = [...this.pendingCameraEffects];
    this.pendingCameraEffects.length = 0;
    return effects;
  }

  /**
   * Get hurtbox for collision detection
   */
  getHurtbox(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x + DEFAULT_HURTBOX.offsetX,
      y: this.getWorldY() + DEFAULT_HURTBOX.offsetY,
      width: DEFAULT_HURTBOX.width,
      height: DEFAULT_HURTBOX.height,
    };
  }

  /**
   * Get active hitbox if attacking
   */
  getActiveHitbox(): ActiveHitbox | null {
    if (!this.currentAttack) return null;

    const attack = this.currentAttack;
    const relativeFrame = this.attackFrame - attack.startup;

    // Check if in active frames
    if (relativeFrame < 0 || relativeFrame >= attack.active) {
      return null;
    }

    return createActiveHitbox(
      this.id,
      { x: this.x, y: this.getWorldY() },
      this.attackFacing ?? this.facing,
      attack
    );
  }

  /**
   * Start an attack
   */
  startAttack(chainIndex?: number, currentFrame = 0): boolean {
    if (!this.canTransitionTo('attacking')) return false;

    const index = chainIndex ?? this.attackChainIndex;
    const attack = createCharacterAttack(this.character, index);

    if (!attack) return false;

    this.currentAttack = this.applyStatFrameScaling(attack);
    this.attackFacing = this.facing;
    this.attackFrame = 0;
    this.attackContacts.clear();
    this.configureAttackPresentation(this.currentAttack);
    this.queuePresentationCues(-1, 0, currentFrame);
    this.attackChainIndex = (index + 1) % getCharacterNormalChainLength(this.character);
    this.attackChainTimeout = FRAME_DATA.COMBO_WINDOW;
    this.setState('attacking');
    return true;
  }

  startSpecial(currentFrame = 0): boolean {
    const attack = createSpecialAttack(this.characterId, this.character.special);
    return this.startSpecialAttack(attack, currentFrame);
  }

  queueSpecialSpawn(move: SpecialMoveDefinition): void {
    this.pendingSpecialSpawns.push(move);
  }

  drainSpecialSpawns(): SpecialMoveDefinition[] {
    const moves = [...this.pendingSpecialSpawns];
    this.pendingSpecialSpawns.length = 0;
    return moves;
  }

  startSpecialAttack(attack: AttackData, currentFrame = 0): boolean {
    if (!this.canTransitionTo('special')) return false;

    this.currentAttack = this.applyStatFrameScaling(attack);
    this.attackFacing = this.facing;
    this.attackFrame = 0;
    this.attackContacts.clear();
    this.configureAttackPresentation(this.currentAttack);
    this.queuePresentationCues(-1, 0, currentFrame);
    this.specialCooldown = this.specialMaxCooldown;
    this.isBlocking = false;
    this.setState('special');
    return true;
  }

  canHitTarget(targetId: string, currentFrame: number): boolean {
    if (!this.currentAttack) {
      return false;
    }

    return canRegisterAttackContact(
      this.currentAttack,
      this.attackContacts,
      targetId,
      currentFrame
    );
  }

  registerHitTarget(targetId: string, currentFrame: number): void {
    registerAttackContact(this.attackContacts, targetId, currentFrame);
  }

  /**
   * Start blocking
   */
  startBlocking(currentFrame: number): boolean {
    if (!this.canTransitionTo('blocking')) return false;

    this.isBlocking = true;
    this.blockStartedFrame = currentFrame;
    this.setState('blocking');
    return true;
  }

  /**
   * Stop blocking
   */
  stopBlocking(): void {
    this.isBlocking = false;
    if (this.state === 'blocking') {
      this.setState('idle');
    }
  }

  /**
   * Take damage
   */
  applyExternalImpulse(knockbackX: number, knockbackY: number, decay = 0.95): void {
    this.velocityX = knockbackX;
    this.velocityY = knockbackY;
    this.externalVelocityDecay = decay;

    if (knockbackY > 0) {
      this.isGrounded = false;
      this.y = Math.max(this.y, knockbackY * 0.35);
    }
  }

  takeDamage(
    damage: number,
    knockbackX: number,
    knockbackY: number,
    hitstun: number,
    decay = 0.95,
    options?: { knockdown?: boolean }
  ): void {
    this.health = Math.max(0, this.health - damage);
    this.moveVelocityX = 0;
    this.blockstunFrames = 0;
    this.applyExternalImpulse(knockbackX, knockbackY, decay);
    this.hitstunFrames = hitstun;
    this.triggerRecoil(
      knockbackX || -1,
      1 + Math.abs(knockbackX) * 0.08 + Math.abs(knockbackY) * 0.06
    );
    this.pendingKnockdown = options?.knockdown ?? this.pendingKnockdown;

    if (hitstun > 0) {
      this.currentAttack = null;
      this.attackFacing = null;
      this.attackFrame = 0;
      this.attackContacts.clear();
      this.resetAttackPresentation();
      this.isBlocking = false;
      this.setState('hitstun');
    }
  }

  takeBlockedHit(damage: number, pushbackX: number, blockstun: number, decay = 0.72): void {
    this.health = Math.max(0, this.health - damage);
    this.moveVelocityX = 0;
    this.hitstunFrames = 0;
    this.blockstunFrames = blockstun;
    this.isBlocking = true;
    this.applyExternalImpulse(pushbackX, 0, decay);
    this.triggerRecoil(pushbackX || -1, 0.7 + Math.abs(pushbackX) * 0.05);

    if (this.state !== 'blocking') {
      this.setState('blocking');
    }
  }

  /**
   * Update fighter state
   */
  update(deltaTime: number, currentFrame: number): void {
    this.stateFrame++;
    this.stateTimer += deltaTime;

    // Update attack
    if (this.currentAttack) {
      const previousAttackFrame = this.attackFrame;
      this.attackFrame++;
      this.queuePresentationCues(previousAttackFrame, this.attackFrame, currentFrame);

      const totalFrames =
        this.currentAttack.startup + this.currentAttack.active + this.currentAttack.recovery;
      if (this.attackFrame >= totalFrames) {
        this.currentAttack = null;
        this.attackFacing = null;
        this.attackFrame = 0;
        this.attackContacts.clear();
        this.resetAttackPresentation();
        if (this.state === 'attacking' || this.state === 'special') {
          this.setState('idle');
        }
      }
    }

    // Update attack chain timeout
    if (this.attackChainTimeout > 0) {
      this.attackChainTimeout--;
      if (this.attackChainTimeout === 0) {
        this.attackChainIndex = 0;
      }
    }

    // Update hitstun
    if (this.hitstunFrames > 0) {
      this.hitstunFrames--;
      if (this.hitstunFrames === 0 && this.state === 'hitstun') {
        this.setState('idle');
      }
    }

    if (this.blockstunFrames > 0) {
      this.blockstunFrames--;
    }

    // Update invulnerability
    if (this.invulnerableFrames > 0) {
      this.invulnerableFrames--;
    }

    // Update special cooldown
    if (this.specialCooldown > 0) {
      this.specialCooldown--;
    }
    this.specialState = tickFighterSpecialState(this.specialState);

    if (this.landingFrames > 0) {
      this.landingFrames--;
    }

    if (this.turnaroundFrames > 0) {
      this.turnaroundFrames--;
      if (this.turnaroundFrames === 0) {
        this.turnaroundFrom = null;
      }
    }

    if (this.recoilFrames > 0) {
      this.recoilFrames--;
      if (this.recoilFrames === 0) {
        this.recoilDirection = 0;
      }
    }

    if (this.state === 'knockdown' && this.stateFrame >= FRAME_DATA.KNOCKDOWN_DURATION) {
      this.forceState('gettingUp');
    } else if (this.state === 'gettingUp' && this.stateFrame >= FRAME_DATA.GET_UP_DURATION) {
      this.forceState('idle');
    }

    applyFighterMotor(this);

    if (
      this.pendingKnockdown &&
      this.isGrounded &&
      this.state !== 'knockdown' &&
      this.state !== 'gettingUp'
    ) {
      this.pendingKnockdown = false;
      this.currentAttack = null;
      this.attackFacing = null;
      this.attackFrame = 0;
      this.attackContacts.clear();
      this.resetAttackPresentation();
      this.hitstunFrames = 0;
      this.blockstunFrames = 0;
      this.isBlocking = false;
      this.moveVelocityX = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.forceState('knockdown');
    }
  }

  /**
   * Get debug info
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      id: this.id,
      state: this.state,
      health: `${this.health}/${this.stats.maxHealth}`,
      position: `(${Math.round(this.x)}, ${Math.round(this.y)})`,
      velocity: `(${(this.moveVelocityX + this.velocityX).toFixed(2)}, ${this.velocityY.toFixed(2)})`,
      facing: this.facing,
      lane: this.lane,
      combo: this.combo.count,
    };
  }
}

export type { CharacterDefinition } from '@/content/characters/character-data';
