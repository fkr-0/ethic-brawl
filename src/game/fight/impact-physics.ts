import type { HitResult } from './combat';
import type { Fighter } from './fighter';
import type { AttackType } from './fighter-state';

const IMPACT_DECAY: Record<'blocked' | AttackType, number> = {
  blocked: 0.72,
  light: 0.8,
  medium: 0.86,
  heavy: 0.91,
  special: 0.93,
};

const BLOCK_RECOIL: Record<AttackType, number> = {
  light: 0.8,
  medium: 1.05,
  heavy: 1.3,
  special: 1.45,
};

function shouldLaunchTarget(result: HitResult): boolean {
  return result.launches && result.knockbackY > 0;
}

function getDefenderDecay(result: HitResult): number {
  return result.type === 'blocked' || result.type === 'perfect_block'
    ? IMPACT_DECAY.blocked
    : IMPACT_DECAY[result.attackType];
}

function getWeightedImpulse(fighter: Fighter, impulse: number): number {
  return impulse / fighter.movement.weight;
}

function shouldCauseKnockdown(result: HitResult): boolean {
  if (result.type !== 'hit' || !result.launches) {
    return false;
  }

  return (
    result.attackType === 'heavy' ||
    result.attackType === 'special' ||
    result.knockbackY >= 4 ||
    result.hitstun >= 20
  );
}

export function applyHitResultToDefender(fighter: Fighter, result: HitResult): void {
  const knockbackX = getWeightedImpulse(fighter, result.knockbackX);
  const knockbackY = shouldLaunchTarget(result)
    ? getWeightedImpulse(fighter, result.knockbackY)
    : 0;
  const decay = getDefenderDecay(result);

  if (result.type === 'blocked' || result.type === 'perfect_block') {
    fighter.takeBlockedHit(result.actualDamage, knockbackX, result.hitstun, decay);
    return;
  }

  fighter.takeDamage(result.actualDamage, knockbackX, knockbackY, result.hitstun, decay, {
    knockdown: shouldCauseKnockdown(result),
  });
}

export function applyBlockRecoilToAttacker(attacker: Fighter, result: HitResult): void {
  if (result.type !== 'blocked' && result.type !== 'perfect_block') {
    return;
  }

  const baseDirection = attacker.facing === 'right' ? -1 : 1;
  const recoilX =
    baseDirection *
    ((BLOCK_RECOIL[result.attackType] * result.attackerBlockRecoilMultiplier) /
      attacker.movement.weight);
  const recoilDecay = result.type === 'perfect_block' ? 0.68 : 0.74;
  attacker.applyExternalImpulse(recoilX, 0, recoilDecay);
}
