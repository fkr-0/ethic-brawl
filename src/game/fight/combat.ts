/**
 * Combat resolution logic
 */

import { runAbilities } from '@/game/abilities/ability-system';
import type { ComboState } from './combo';
import { getComboMultiplier, getScaledDamage } from './combo';
import type { AttackType, FighterStats } from './fighter-state';
import { FRAME_DATA } from './fighter-state';
import type { ActiveHitbox } from './hitbox';
import { checkHit } from './hitbox';
import {
  CHIP_BLOCK_PROFILE_BEHAVIOR,
  COUNTER_HIT_PROFILE_BEHAVIOR,
  LANE_REACH_MAX_DELTA,
  LAUNCH_CLASS_BEHAVIOR,
} from './move-class-presets';

export type HitResultType = 'hit' | 'blocked' | 'perfect_block' | 'miss';

export interface HitResult {
  type: HitResultType;
  damage: number;
  actualDamage: number;
  knockbackX: number;
  knockbackY: number;
  hitstun: number;
  attackType: AttackType;
  launches: boolean;
  isCounterHit: boolean;
  attackerBlockRecoilMultiplier: number;
  riposteWindow?: number;
}

export interface FighterCombatState {
  x: number;
  y: number;
  lane: number;
  health: number;
  maxHealth: number;
  stats: FighterStats;
  state: string;
  stateFrame: number;
  facing: 'left' | 'right';
  velocityX: number;
  velocityY: number;
  isGrounded: boolean;
  isBlocking: boolean;
  blockStartedFrame: number;
  hitstunFrames: number;
  combo: ComboState;
  currentAttackId: string | null;
  attackFrame: number;
  abilities?: string[];
}

function isCounterHitState(defender: FighterCombatState): boolean {
  return (
    defender.currentAttackId !== null ||
    defender.state === 'attacking' ||
    defender.state === 'special'
  );
}

export function calculateDamage(
  baseDamage: number,
  attacker: FighterStats,
  defender: FighterStats,
  isBlocking: boolean
): number {
  const strengthScale = 1 + attacker.strength * 0.04;
  const intelligenceBonus = attacker.intelligence * 0.015;
  const defenseReduction = defender.defense * 0.02;
  const vitalityReduction = defender.vitality * 0.015;

  let damage =
    baseDamage *
    strengthScale *
    (1 + intelligenceBonus) *
    (1 - defenseReduction - vitalityReduction);

  if (isBlocking) {
    damage *= FRAME_DATA.BLOCK_DAMAGE_REDUCTION;
  }

  return Math.max(1, Math.floor(damage));
}

export function applyAgilityToFrames(baseFrames: number, agility: number): number {
  const modifier = 1 - Math.min(0.4, agility * 0.02);
  return Math.max(1, Math.floor(baseFrames * modifier));
}

export function canUseSpecial(stats: FighterStats, currentEnergy: number): boolean {
  return currentEnergy >= 20 - stats.energy * 1.5;
}

export function calculateKnockback(
  baseKnockbackX: number,
  baseKnockbackY: number,
  combo: ComboState
): { x: number; y: number } {
  const { damageBonus } = getComboMultiplier(combo);
  const multiplier = 1 + damageBonus + combo.count * 0.05;

  return {
    x: baseKnockbackX * multiplier,
    y: baseKnockbackY * multiplier,
  };
}

export function calculateHitstun(baseHitstun: number, combo: ComboState): number {
  const { hitstunExtension } = getComboMultiplier(combo);
  return baseHitstun + hitstunExtension;
}

export function isPerfectBlock(blockStartedFrame: number, attackFrame: number): boolean {
  const framesSinceBlockStart = attackFrame - blockStartedFrame;
  return framesSinceBlockStart <= FRAME_DATA.PERFECT_BLOCK_WINDOW;
}

export function resolveHit(
  attacker: FighterCombatState,
  defender: FighterCombatState,
  hitbox: ActiveHitbox,
  hurtbox: { x: number; y: number; width: number; height: number },
  currentFrame: number
): HitResult {
  const maxLaneDelta = LANE_REACH_MAX_DELTA[hitbox.moveClass.laneReach];
  if (Math.abs(attacker.lane - defender.lane) > maxLaneDelta) {
    return createMissResult(hitbox.type);
  }

  if (!checkHit(hitbox, hurtbox)) {
    return createMissResult(hitbox.type);
  }

  const blockProfile = CHIP_BLOCK_PROFILE_BEHAVIOR[hitbox.moveClass.chipBlockProfile];
  const counterProfile = COUNTER_HIT_PROFILE_BEHAVIOR[hitbox.moveClass.counterHitProfile];
  const launchProfile = LAUNCH_CLASS_BEHAVIOR[hitbox.moveClass.launchClass];

  if (defender.isBlocking) {
    const isPerfect = isPerfectBlock(defender.blockStartedFrame, currentFrame);

    if (isPerfect) {
      return {
        type: 'perfect_block',
        damage: 0,
        actualDamage: 0,
        knockbackX: 0,
        knockbackY: 0,
        hitstun: 0,
        attackType: hitbox.type,
        launches: false,
        isCounterHit: false,
        attackerBlockRecoilMultiplier: blockProfile.attackerRecoilMultiplier,
        riposteWindow: FRAME_DATA.RIPOSTE_ADVANTAGE,
      };
    }

    const chipDamage = calculateDamage(
      hitbox.damage * blockProfile.chipDamageRatio,
      attacker.stats,
      defender.stats,
      false
    );

    const blockedResult: HitResult = {
      type: 'blocked',
      damage: hitbox.damage,
      actualDamage: chipDamage,
      knockbackX: hitbox.knockbackX * blockProfile.pushbackMultiplier,
      knockbackY: 0,
      hitstun: Math.floor(hitbox.hitstun * blockProfile.blockstunMultiplier),
      attackType: hitbox.type,
      launches: false,
      isCounterHit: false,
      attackerBlockRecoilMultiplier: blockProfile.attackerRecoilMultiplier,
    };

    runAbilities(attacker.abilities ?? [], 'onBlock', {
      self: attacker,
      opponent: defender,
      frame: currentFrame,
    });

    return blockedResult;
  }

  const isCounterHit = isCounterHitState(defender);
  const scaledDamage = getScaledDamage(hitbox.damage, attacker.combo);
  const counterDamage = isCounterHit
    ? scaledDamage * counterProfile.damageMultiplier
    : scaledDamage;
  const actualDamage = calculateDamage(counterDamage, attacker.stats, defender.stats, false);

  const knockback = calculateKnockback(hitbox.knockbackX, hitbox.knockbackY, attacker.combo);
  const launchKnockbackY = Math.max(
    knockback.y * launchProfile.knockbackYMultiplier +
      (isCounterHit ? counterProfile.knockbackYBonus : 0),
    launchProfile.minimumKnockbackY
  );

  const hitstun =
    calculateHitstun(hitbox.hitstun, attacker.combo) +
    launchProfile.bonusHitstun +
    (isCounterHit ? counterProfile.hitstunBonus : 0);
  const launches =
    launchProfile.forceAirborne ||
    ((hitbox.type === 'heavy' || hitbox.type === 'special') && hitbox.knockbackY > 0) ||
    launchKnockbackY > 0;

  const result: HitResult = {
    type: 'hit',
    damage: hitbox.damage,
    actualDamage,
    knockbackX: knockback.x * (isCounterHit ? counterProfile.knockbackXMultiplier : 1),
    knockbackY: launchKnockbackY,
    hitstun,
    attackType: hitbox.type,
    launches,
    isCounterHit,
    attackerBlockRecoilMultiplier: 1,
  };

  runAbilities(attacker.abilities ?? [], 'onHit', {
    self: attacker,
    opponent: defender,
    frame: currentFrame,
  });

  return result;
}

function createMissResult(attackType: AttackType): HitResult {
  return {
    type: 'miss',
    damage: 0,
    actualDamage: 0,
    knockbackX: 0,
    knockbackY: 0,
    hitstun: 0,
    attackType,
    launches: false,
    isCounterHit: false,
    attackerBlockRecoilMultiplier: 1,
  };
}

export function applyHitResult(
  defender: FighterCombatState,
  result: HitResult,
  _currentFrame: number
): FighterCombatState {
  if (result.type === 'miss') {
    return defender;
  }

  const newHealth = Math.max(0, defender.health - result.actualDamage);
  const newCombo = result.type === 'hit' ? { ...defender.combo, isActive: false } : defender.combo;

  return {
    ...defender,
    health: newHealth,
    state: result.type === 'hit' ? 'hitstun' : defender.state,
    hitstunFrames: result.hitstun,
    velocityX: result.knockbackX,
    velocityY: result.knockbackY,
    combo: newCombo,
  };
}

export function canAct(fighter: FighterCombatState): boolean {
  return (
    fighter.hitstunFrames <= 0 &&
    fighter.state !== 'attacking' &&
    fighter.state !== 'hitstun' &&
    fighter.state !== 'knockdown' &&
    fighter.state !== 'gettingUp' &&
    fighter.state !== 'victory' &&
    fighter.state !== 'defeat'
  );
}

export function canBlock(fighter: FighterCombatState): boolean {
  return canAct(fighter) && fighter.state !== 'jumping' && fighter.state !== 'falling';
}

export function canAttack(fighter: FighterCombatState): boolean {
  return canAct(fighter);
}

export function canJump(fighter: FighterCombatState): boolean {
  return canAct(fighter) && fighter.isGrounded;
}

export function canMove(fighter: FighterCombatState): boolean {
  return canAct(fighter) || fighter.state === 'walking' || fighter.state === 'running';
}
