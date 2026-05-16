/**
 * Fight controller - main fight orchestration
 */

import { ROUNDS_TO_WIN, ROUND_TIME } from '@/app/config';
import type { SpecialMoveDefinition } from '@/content/specials';
import { resolveAttackMoveClass } from '@/game/fight/move-class-presets';
import { getLaneY } from '@/game/physics/lanes';
import {
  type FieldState,
  fieldHitsTarget,
  isFieldTickFrame,
  registerFieldHit,
  spawnField,
  updateField,
} from '@/game/specials/field-system';
import {
  type ProjectileState,
  projectileHitsTarget,
  reflectProjectile,
  spawnProjectile,
  updateProjectile,
} from '@/game/specials/projectile-system';
import {
  applyStatusEffect,
  hasStatusEffect,
  tickStatusEffects,
} from '@/game/specials/status-effects';
import type { HitSparkConfig } from '@/render/effects/hit-sparks';
import { createHitSparks } from '@/render/effects/hit-sparks';
import type { ParticleSystem } from '@/render/effects/particles';
import { createLandingDust as createLandingDustParticles } from '@/render/effects/particles';
import type { ScreenEffect } from '@/render/effects/screen-effects';
import { createFlashEffect, createGlitchEffect } from '@/render/effects/screen-effects';
import { type FightCameraEffect, stepFightCameraEffects } from './attack-presentation-presets';
import { type HitResult, resolveHit } from './combat';
import { applyCombatIntent } from './combat-intent';
import { type ComboState, addComboHit, updateCombo } from './combo';
import { resolveCombatCommand, shouldUseDirectionalCommand } from './command-input';
import type { Fighter } from './fighter';
import { updateFighterMotorFromInput } from './fighter-motor';
import type { Lane } from './fighter-state';
import { applyBlockRecoilToAttacker, applyHitResultToDefender } from './impact-physics';
import {
  type FightVisualEffect,
  createImpactEffects,
  createLandingDustEffect,
  getHitFreezeFrames,
  stepFightVisualEffects,
} from './visual-effects';

/**
 * Player input for a single frame
 */
export interface PlayerInput {
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  block: boolean;
  blockPressed: boolean;
  special: boolean;
  specialPressed: boolean;
}

/**
 * Fight result
 */
export interface FightResult {
  winner: 1 | 2;
  perfect: boolean;
  rounds: number;
  totalTime: number;
  maxCombo: number;
  score: number;
}

/**
 * Round state
 */
export interface RoundState {
  number: number;
  winner: 1 | 2 | null;
  time: number;
  isActive: boolean;
}

/**
 * Fight state
 */
export interface FightState {
  player1: Fighter;
  player2: Fighter;
  round: RoundState;
  scores: [number, number];
  isPaused: boolean;
  isActive: boolean;
  result: FightResult | null;
  frameCount: number;
  combos: [ComboState, ComboState];
  maxCombos: [number, number];
  hitFreezeFrames: number;
  visualEffects: FightVisualEffect[];
  cameraEffects: FightCameraEffect[];
  particleSystems: ParticleSystem[];
  screenEffects: ScreenEffect[];
  projectiles: ProjectileState[];
  fields: FieldState[];
}

/**
 * Get ground Y for a lane
 */
export function getLaneGroundY(lane: Lane): number {
  return getLaneY(lane);
}

/**
 * Create fight controller
 */
export function createFightController() {
  let state: FightState | null = null;
  let onRoundEnd: ((winner: 1 | 2) => void) | null = null;
  let onFightEnd: ((result: FightResult) => void) | null = null;
  let onHit: ((attacker: string, target: string, result: HitResult) => void) | null = null;
  let onCombo: ((player: 1 | 2, count: number) => void) | null = null;

  /**
   * Initialize a new fight
   */
  function init(player1: Fighter, player2: Fighter): void {
    state = {
      player1,
      player2,
      round: {
        number: 1,
        winner: null,
        time: ROUND_TIME,
        isActive: true,
      },
      scores: [0, 0],
      isPaused: false,
      isActive: true,
      result: null,
      frameCount: 0,
      combos: [
        { count: 0, damage: 0, lastHitFrame: 0, isActive: false, hits: [] },
        { count: 0, damage: 0, lastHitFrame: 0, isActive: false, hits: [] },
      ],
      maxCombos: [0, 0],
      hitFreezeFrames: 0,
      visualEffects: [],
      cameraEffects: [],
      particleSystems: [],
      screenEffects: [],
      projectiles: [],
      fields: [],
    };
  }

  /**
   * Update fight state
   */
  function update(deltaTime: number, input1: PlayerInput, input2?: PlayerInput): void {
    if (!state || !state.isActive || state.isPaused) return;

    state.frameCount++;
    state.visualEffects = stepFightVisualEffects(state.visualEffects, [
      state.player1,
      state.player2,
    ]);
    state.cameraEffects = stepFightCameraEffects(state.cameraEffects);

    // Update particle systems
    for (const system of state.particleSystems) {
      system.update();
    }
    // Remove empty particle systems
    state.particleSystems = state.particleSystems.filter((s) => s.getParticleCount() > 0);

    // Update screen effects
    state.screenEffects = state.screenEffects.filter((effect) => effect.update());

    stepFighterStatuses();

    if (state.hitFreezeFrames > 0) {
      state.hitFreezeFrames--;
      checkHits();
      state.combos[0] = updateCombo(state.combos[0], state.frameCount);
      state.combos[1] = updateCombo(state.combos[1], state.frameCount);
      return;
    }

    state.round.time = Math.max(0, state.round.time - deltaTime / 1000);

    // Update fighters
    updateFighter(state.player1, input1, state.frameCount);
    if (input2) {
      updateFighter(state.player2, input2, state.frameCount);
    }
    drainSpecialSpawns();

    // Check for hits
    checkHits();

    updateSpecialProjectiles();
    resolveProjectileHits();
    stepFields();

    // Update combos
    state.combos[0] = updateCombo(state.combos[0], state.frameCount);
    state.combos[1] = updateCombo(state.combos[1], state.frameCount);

    // Track max combos
    if (state.combos[0].count > state.maxCombos[0]) {
      state.maxCombos[0] = state.combos[0].count;
    }
    if (state.combos[1].count > state.maxCombos[1]) {
      state.maxCombos[1] = state.combos[1].count;
    }

    // Check round end conditions
    checkRoundEnd();

    if (state.hitFreezeFrames > 0) {
      return;
    }

    const player1LandingBefore = state.player1.landingFrames;
    const player2LandingBefore = state.player2.landingFrames;

    // Update fighter physics
    state.player1.update(deltaTime, state.frameCount);
    state.player2.update(deltaTime, state.frameCount);

    if (state.player1.landingFrames > player1LandingBefore && state.player1.landingFrames > 0) {
      state.visualEffects.push(createLandingDustEffect(state.player1, state.frameCount));
      state.particleSystems.push(
        createLandingDustParticles(
          state.player1.x,
          state.player1.getWorldY(),
          state.player1.character.colors.secondary
        )
      );
    }

    if (state.player2.landingFrames > player2LandingBefore && state.player2.landingFrames > 0) {
      state.visualEffects.push(createLandingDustEffect(state.player2, state.frameCount));
      state.particleSystems.push(
        createLandingDustParticles(
          state.player2.x,
          state.player2.getWorldY(),
          state.player2.character.colors.secondary
        )
      );
    }

    state.visualEffects.push(...state.player1.drainPresentationEffects());
    state.visualEffects.push(...state.player2.drainPresentationEffects());
    state.cameraEffects.push(...state.player1.drainCameraEffects());
    state.cameraEffects.push(...state.player2.drainCameraEffects());

    // Auto-face opponents
    autoFaceOpponents();
  }

  /**
   * Update a single fighter
   */
  function updateFighter(fighter: Fighter, input: PlayerInput, currentFrame: number): void {
    const horizontalDirection = input.moveLeft === input.moveRight ? 0 : input.moveLeft ? -1 : 1;
    const verticalDirection = input.moveUp === input.moveDown ? 0 : input.moveUp ? 1 : -1;
    const horizontalPressed = horizontalDirection !== 0 && fighter.previousHorizontalInput === 0;
    const verticalPressed = verticalDirection !== 0 && fighter.previousVerticalInput === 0;

    updateFighterMotorFromInput(fighter, {
      horizontalDirection,
      horizontalPressed,
      verticalDirection,
      verticalPressed,
      jumpPressed: input.jumpPressed,
      currentFrame,
    });

    const command = shouldUseDirectionalCommand(fighter)
      ? resolveCombatCommand({
          block: input.block,
          attackPressed: input.attackPressed,
          jumpPressed: input.jumpPressed,
          horizontalDirection: horizontalDirection as -1 | 0 | 1,
          verticalDirection: verticalDirection as -1 | 0 | 1,
          facing: fighter.facing,
        })
      : null;

    applyCombatIntent(fighter, {
      attackPressed: input.attackPressed,
      block: input.block,
      specialPressed: input.specialPressed,
      jumpPressed: input.jumpPressed,
      command,
      currentFrame,
    });

    // Roll (run + block)
    if (fighter.isRunning && input.block && fighter.isGrounded) {
      // TODO: Implement roll
    }

    fighter.previousHorizontalInput = horizontalDirection;
    fighter.previousVerticalInput = verticalDirection;
  }

  /**
   * Check for hits between fighters
   */
  function checkHits(): void {
    if (!state) return;

    // Check player 1 attacking player 2
    const p1Hitbox = state.player1.getActiveHitbox();
    if (
      p1Hitbox &&
      !state.player2.invulnerableFrames &&
      state.player1.canHitTarget(state.player2.id, state.frameCount)
    ) {
      const result = resolveHit(
        {
          x: state.player1.x,
          y: state.player1.getWorldY(),
          lane: state.player1.lane,
          health: state.player1.health,
          maxHealth: state.player1.stats.maxHealth,
          stats: state.player1.stats,
          state: state.player1.state,
          stateFrame: state.player1.stateFrame,
          facing: state.player1.facing,
          velocityX: state.player1.velocityX,
          velocityY: state.player1.velocityY,
          isGrounded: state.player1.isGrounded,
          isBlocking: state.player1.isBlocking,
          blockStartedFrame: state.player1.blockStartedFrame,
          hitstunFrames: state.player1.hitstunFrames,
          combo: state.combos[0],
          currentAttackId: state.player1.currentAttack?.id ?? null,
          attackFrame: state.player1.attackFrame,
          abilities: state.player1.character.abilities ?? [],
        },
        {
          x: state.player2.x,
          y: state.player2.getWorldY(),
          lane: state.player2.lane,
          health: state.player2.health,
          maxHealth: state.player2.stats.maxHealth,
          stats: state.player2.stats,
          state: state.player2.state,
          stateFrame: state.player2.stateFrame,
          facing: state.player2.facing,
          velocityX: state.player2.velocityX,
          velocityY: state.player2.velocityY,
          isGrounded: state.player2.isGrounded,
          isBlocking: state.player2.isBlocking,
          blockStartedFrame: state.player2.blockStartedFrame,
          hitstunFrames: state.player2.hitstunFrames,
          combo: state.combos[1],
          currentAttackId: state.player2.currentAttack?.id ?? null,
          attackFrame: state.player2.attackFrame,
          abilities: state.player2.character.abilities ?? [],
        },
        p1Hitbox,
        state.player2.getHurtbox(),
        state.frameCount
      );

      if (result.type !== 'miss') {
        state.player1.registerHitTarget(state.player2.id, state.frameCount);
        applyHitToFighter(state.player1, state.player2, result);

        // Update combo
        if (result.type === 'hit') {
          state.combos[0] = addComboHit(
            state.combos[0],
            result.actualDamage,
            p1Hitbox.type,
            state.frameCount
          );
          if (onCombo) {
            onCombo(1, state.combos[0].count);
          }
        }

        if (onHit) {
          onHit(state.player1.id, state.player2.id, result);
        }
      }
    }

    // Check player 2 attacking player 1
    const p2Hitbox = state.player2.getActiveHitbox();
    if (
      p2Hitbox &&
      !state.player1.invulnerableFrames &&
      state.player2.canHitTarget(state.player1.id, state.frameCount)
    ) {
      const result = resolveHit(
        {
          x: state.player2.x,
          y: state.player2.getWorldY(),
          lane: state.player2.lane,
          health: state.player2.health,
          maxHealth: state.player2.stats.maxHealth,
          stats: state.player2.stats,
          state: state.player2.state,
          stateFrame: state.player2.stateFrame,
          facing: state.player2.facing,
          velocityX: state.player2.velocityX,
          velocityY: state.player2.velocityY,
          isGrounded: state.player2.isGrounded,
          isBlocking: state.player2.isBlocking,
          blockStartedFrame: state.player2.blockStartedFrame,
          hitstunFrames: state.player2.hitstunFrames,
          combo: state.combos[1],
          currentAttackId: state.player2.currentAttack?.id ?? null,
          attackFrame: state.player2.attackFrame,
          abilities: state.player2.character.abilities ?? [],
        },
        {
          x: state.player1.x,
          y: state.player1.getWorldY(),
          lane: state.player1.lane,
          health: state.player1.health,
          maxHealth: state.player1.stats.maxHealth,
          stats: state.player1.stats,
          state: state.player1.state,
          stateFrame: state.player1.stateFrame,
          facing: state.player1.facing,
          velocityX: state.player1.velocityX,
          velocityY: state.player1.velocityY,
          isGrounded: state.player1.isGrounded,
          isBlocking: state.player1.isBlocking,
          blockStartedFrame: state.player1.blockStartedFrame,
          hitstunFrames: state.player1.hitstunFrames,
          combo: state.combos[0],
          currentAttackId: state.player1.currentAttack?.id ?? null,
          attackFrame: state.player1.attackFrame,
          abilities: state.player1.character.abilities ?? [],
        },
        p2Hitbox,
        state.player1.getHurtbox(),
        state.frameCount
      );

      if (result.type !== 'miss') {
        state.player2.registerHitTarget(state.player1.id, state.frameCount);
        applyHitToFighter(state.player2, state.player1, result);

        // Update combo
        if (result.type === 'hit') {
          state.combos[1] = addComboHit(
            state.combos[1],
            result.actualDamage,
            p2Hitbox.type,
            state.frameCount
          );
          if (onCombo) {
            onCombo(2, state.combos[1].count);
          }
        }

        if (onHit) {
          onHit(state.player2.id, state.player1.id, result);
        }
      }
    }
  }

  /**
   * Apply hit result to fighter
   */
  function applyHitToFighter(attacker: Fighter, defender: Fighter, result: HitResult): void {
    if (!state) {
      return;
    }

    applyHitResultToDefender(defender, result);
    applyBlockRecoilToAttacker(attacker, result);
    state.visualEffects.push(...createImpactEffects(attacker, defender, result, state.frameCount));
    state.hitFreezeFrames = Math.max(state.hitFreezeFrames, getHitFreezeFrames(result));

    // Add particle effects
    const hitCenterX = (attacker.x + defender.x) / 2;
    const hitCenterY = defender.getWorldY() - 46;

    if (result.type === 'perfect_block') {
      const sparkConfig: HitSparkConfig = {
        x: hitCenterX,
        y: hitCenterY,
        direction: attacker.facing === 'right' ? 1 : -1,
        color: '#FFD700',
        size: 'large',
        type: 'perfect_block',
      };
      state.particleSystems.push(createHitSparks(sparkConfig));
    } else if (result.type === 'blocked') {
      const sparkConfig: HitSparkConfig = {
        x: hitCenterX,
        y: hitCenterY,
        direction: attacker.facing === 'right' ? 1 : -1,
        color: '#00F5FF',
        size: 'small',
        type: 'block',
      };
      state.particleSystems.push(createHitSparks(sparkConfig));
    } else if (result.type === 'hit') {
      const sparkConfig: HitSparkConfig = {
        x: hitCenterX,
        y: hitCenterY,
        direction: attacker.facing === 'right' ? 1 : -1,
        color: result.attackType === 'special' ? '#39FF14' : '#FFA500',
        size: result.attackType === 'heavy' || result.attackType === 'special' ? 'large' : 'medium',
        type: result.attackType === 'special' ? 'special' : 'hit',
      };
      state.particleSystems.push(createHitSparks(sparkConfig));

      // Add screen flash for heavy hits
      if (result.attackType === 'heavy' || result.attackType === 'special') {
        state.screenEffects.push(createFlashEffect(8, '#FFFFFF', 0.4));
      }
    }

    // Add glitch effect for special attacks
    if (result.attackType === 'special') {
      state.screenEffects.push(createGlitchEffect(15, 0.3));
    }
  }

  function drainSpecialSpawns(): void {
    if (!state) return;

    spawnSpecialEntitiesForFighter(state.player1, state.player1.drainSpecialSpawns());
    spawnSpecialEntitiesForFighter(state.player2, state.player2.drainSpecialSpawns());
  }

  function spawnSpecialEntitiesForFighter(fighter: Fighter, moves: SpecialMoveDefinition[]): void {
    if (!state) return;

    for (const move of moves) {
      const spawnX = fighter.x + (fighter.facing === 'right' ? 38 : -38);
      const spawnY = fighter.getWorldY() - 62;

      if (move.projectile) {
        state.projectiles.push(
          spawnProjectile(move.projectile, fighter.id, spawnX, spawnY, fighter.lane, fighter.facing)
        );
      }

      if (move.field) {
        state.fields.push(
          spawnField(
            move.field,
            fighter.id,
            move.id,
            fighter.x,
            fighter.getWorldY() - 48,
            fighter.lane,
            Math.max(1, Math.round(move.energyCost * 0.08)),
            move.statusEffects ?? []
          )
        );
      }

      if (!move.projectile && !move.field && move.statusEffects?.length) {
        for (const effect of move.statusEffects) {
          fighter.statusEffects = applyStatusEffect(fighter.statusEffects, effect, fighter.id);
        }
      }
    }
  }

  function stepFighterStatuses(): void {
    if (!state) return;

    for (const fighter of [state.player1, state.player2]) {
      const tick = tickStatusEffects(fighter.statusEffects);
      fighter.statusEffects = tick.effects;
      if (tick.damage > 0) {
        fighter.health = Math.max(0, fighter.health - tick.damage);
      }
    }
  }

  function updateSpecialProjectiles(): void {
    if (!state) return;
    state.projectiles = state.projectiles
      .map((projectile) => updateProjectile(projectile))
      .filter((projectile): projectile is ProjectileState => projectile !== null);
  }

  function stepFields(): void {
    if (!state) return;

    const nextFields: FieldState[] = [];
    for (const field of state.fields) {
      const caster = field.ownerId === state.player1.id ? state.player1 : state.player2;
      const updated = updateField(field, {
        x: caster.x,
        y: caster.getWorldY() - 48,
        lane: caster.lane,
      });
      if (!updated) continue;

      if (!isFieldTickFrame(updated)) {
        nextFields.push(updated);
        continue;
      }

      let tickedField = updated;
      for (const target of [state.player1, state.player2]) {
        if (
          !fieldHitsTarget(tickedField, {
            id: target.id,
            ownerId: target.id,
            x: target.x,
            y: target.getWorldY() - 40,
            width: 50,
            height: 80,
            lane: target.lane,
          })
        ) {
          continue;
        }

        if (tickedField.damagePerTick > 0) {
          target.health = Math.max(0, target.health - tickedField.damagePerTick);
        }
        for (const effect of tickedField.statusEffects) {
          target.statusEffects = applyStatusEffect(
            target.statusEffects,
            effect,
            tickedField.ownerId
          );
        }
        tickedField = registerFieldHit(tickedField, target.id);
      }
      nextFields.push(tickedField);
    }
    state.fields = nextFields;
  }

  /**
   * Auto-face opponents
   */
  function autoFaceOpponents(): void {
    if (!state) return;

    if (state.player1.x < state.player2.x) {
      state.player1.setFacing('right');
      state.player2.setFacing('left');
    } else {
      state.player1.setFacing('left');
      state.player2.setFacing('right');
    }
  }

  function resolveProjectileHits(): void {
    if (!state) return;

    const remaining: ProjectileState[] = [];
    for (const projectile of state.projectiles) {
      const attacker = projectile.ownerId === state.player1.id ? state.player1 : state.player2;
      const defender = projectile.ownerId === state.player1.id ? state.player2 : state.player1;

      if (
        !projectileHitsTarget(projectile, {
          id: defender.id,
          x: defender.x - 25,
          y: defender.getWorldY() - 80,
          width: 50,
          height: 80,
          lane: defender.lane,
          ownerId: defender.id,
        })
      ) {
        remaining.push(projectile);
        continue;
      }

      if (hasStatusEffect(defender.statusEffects, 'reflect')) {
        remaining.push(reflectProjectile(projectile, defender.id));
        continue;
      }

      const hitbox = {
        x: projectile.x,
        y: projectile.y,
        width: 16,
        height: 16,
        damage: 6,
        knockbackX: 3,
        knockbackY: 0,
        hitstun: 12,
        type: 'special' as const,
        owner: attacker.id,
        moveClass: resolveAttackMoveClass({ moveClassPreset: 'standard_strike' }),
      };

      const result = resolveHit(
        {
          x: attacker.x,
          y: attacker.getWorldY(),
          lane: attacker.lane,
          health: attacker.health,
          maxHealth: attacker.stats.maxHealth,
          stats: attacker.stats,
          state: attacker.state,
          stateFrame: attacker.stateFrame,
          facing: attacker.facing,
          velocityX: attacker.velocityX,
          velocityY: attacker.velocityY,
          isGrounded: attacker.isGrounded,
          isBlocking: attacker.isBlocking,
          blockStartedFrame: attacker.blockStartedFrame,
          hitstunFrames: attacker.hitstunFrames,
          combo: attacker === state.player1 ? state.combos[0] : state.combos[1],
          currentAttackId: `projectile_${projectile.id}`,
          attackFrame: 0,
          abilities: attacker.character.abilities ?? [],
        },
        {
          x: defender.x,
          y: defender.getWorldY(),
          lane: defender.lane,
          health: defender.health,
          maxHealth: defender.stats.maxHealth,
          stats: defender.stats,
          state: defender.state,
          stateFrame: defender.stateFrame,
          facing: defender.facing,
          velocityX: defender.velocityX,
          velocityY: defender.velocityY,
          isGrounded: defender.isGrounded,
          isBlocking: defender.isBlocking,
          blockStartedFrame: defender.blockStartedFrame,
          hitstunFrames: defender.hitstunFrames,
          combo: defender === state.player1 ? state.combos[0] : state.combos[1],
          currentAttackId: defender.currentAttack?.id ?? null,
          attackFrame: defender.attackFrame,
          abilities: defender.character.abilities ?? [],
        },
        hitbox,
        defender.getHurtbox(),
        state.frameCount
      );

      if (result.type !== 'miss') {
        applyHitToFighter(attacker, defender, result);
      } else {
        remaining.push(projectile);
      }
    }
    state.projectiles = remaining;
  }

  /**
   * Check for round end conditions
   */
  function checkRoundEnd(): void {
    if (!state) return;

    // Time out
    if (state.round.time <= 0) {
      // Winner is whoever has more health
      const winner = state.player1.health >= state.player2.health ? 1 : 2;
      endRound(winner as 1 | 2);
      return;
    }

    // KO
    if (state.player1.health <= 0) {
      endRound(2);
      return;
    }

    if (state.player2.health <= 0) {
      endRound(1);
      return;
    }
  }

  /**
   * End the current round
   */
  function endRound(winner: 1 | 2): void {
    if (!state) return;

    state.round.winner = winner;
    state.round.isActive = false;
    const winnerScore = state.scores[winner - 1];
    if (winnerScore !== undefined) {
      state.scores[winner - 1] = winnerScore + 1;
    }

    // Check for match end
    const finalScore = state.scores[winner - 1] ?? 0;
    if (finalScore >= ROUNDS_TO_WIN) {
      const perfect =
        winner === 1
          ? state.player2.health === 0 && state.player1.health === state.player1.stats.maxHealth
          : state.player1.health === 0 && state.player2.health === state.player2.stats.maxHealth;

      state.result = {
        winner,
        perfect,
        rounds: state.round.number,
        totalTime: ROUND_TIME * state.round.number - state.round.time,
        maxCombo: Math.max(state.maxCombos[0], state.maxCombos[1]),
        score: calculateScore(winner),
      };
      state.isActive = false;

      if (onFightEnd) {
        onFightEnd(state.result);
      }
    } else {
      if (onRoundEnd) {
        onRoundEnd(winner);
      }
    }
  }

  /**
   * Calculate score
   */
  function calculateScore(winner: 1 | 2): number {
    if (!state) return 0;

    const baseScore = 1000;
    const timeBonus = Math.floor(state.round.time * 10);
    const maxCombo = state.maxCombos[winner - 1] ?? 0;
    const comboBonus = maxCombo * 50;
    const perfectBonus = state.result?.perfect ? 500 : 0;

    return baseScore + timeBonus + comboBonus + perfectBonus;
  }

  /**
   * Start next round
   */
  function startNextRound(): void {
    if (!state) return;

    state.round.number++;
    state.round.winner = null;
    state.round.time = ROUND_TIME;
    state.round.isActive = true;

    // Reset fighters
    state.player1.health = state.player1.stats.maxHealth;
    state.player1.x = 200;
    state.player1.setState('idle');
    state.player2.health = state.player2.stats.maxHealth;
    state.player2.x = 760;
    state.player2.setState('idle');

    // Reset combos
    state.combos = [
      { count: 0, damage: 0, lastHitFrame: 0, isActive: false, hits: [] },
      { count: 0, damage: 0, lastHitFrame: 0, isActive: false, hits: [] },
    ];
    state.visualEffects = [];
    state.cameraEffects = [];
    state.particleSystems = [];
    state.screenEffects = [];
    state.hitFreezeFrames = 0;
  }

  /**
   * Pause/resume
   */
  function pause(): void {
    if (state) state.isPaused = true;
  }

  function resume(): void {
    if (state) state.isPaused = false;
  }

  /**
   * Set callbacks
   */
  function setOnRoundEnd(callback: (winner: 1 | 2) => void): void {
    onRoundEnd = callback;
  }

  function setOnFightEnd(callback: (result: FightResult) => void): void {
    onFightEnd = callback;
  }

  function setOnHit(callback: (attacker: string, target: string, result: HitResult) => void): void {
    onHit = callback;
  }

  function setOnCombo(callback: (player: 1 | 2, count: number) => void): void {
    onCombo = callback;
  }

  /**
   * Get current state
   */
  function getState(): FightState | null {
    return state;
  }

  return {
    init,
    update,
    pause,
    resume,
    startNextRound,
    setOnRoundEnd,
    setOnFightEnd,
    setOnHit,
    setOnCombo,
    getState,
    getLaneGroundY,
  };
}
