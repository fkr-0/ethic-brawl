import type { HitResult } from './combat';
import type { Fighter } from './fighter';
import type { Lane } from './fighter-state';

export type FightVisualEffectPresetId =
  | 'hit_spark_light'
  | 'hit_spark_medium'
  | 'hit_spark_heavy'
  | 'hit_spark_special'
  | 'block_guard'
  | 'perfect_guard'
  | 'launcher_pop'
  | 'special_burst'
  | 'landing_dust'
  | 'startup_flash'
  | 'swing_arc_light'
  | 'swing_arc_medium'
  | 'swing_arc_heavy'
  | 'swing_arc_special'
  | 'recovery_echo'
  | 'special_sigils';

export interface FightVisualEffect {
  id: string;
  preset: FightVisualEffectPresetId;
  lane: Lane;
  x: number;
  y: number;
  ttl: number;
  totalTtl: number;
  scale: number;
  color: string;
  layer: 'behind' | 'front';
  attachedTo?: string;
  offsetX?: number;
  offsetY?: number;
}

const IMPACT_PRESET_BY_ATTACK = {
  light: 'hit_spark_light',
  medium: 'hit_spark_medium',
  heavy: 'hit_spark_heavy',
  special: 'hit_spark_special',
} satisfies Record<HitResult['attackType'], FightVisualEffectPresetId>;

function createEffectId(prefix: string, currentFrame: number, suffix: string): string {
  return `${prefix}_${currentFrame}_${suffix}`;
}

export function getHitFreezeFrames(result: HitResult): number {
  if (result.type === 'perfect_block') {
    return 5;
  }
  if (result.type === 'blocked') {
    return result.attackType === 'heavy' || result.attackType === 'special' ? 4 : 2;
  }

  if (result.attackType === 'special') {
    return 5;
  }
  if (result.attackType === 'heavy') {
    return 4;
  }
  if (result.attackType === 'medium') {
    return 3;
  }
  return 2;
}

export function createImpactEffects(
  attacker: Fighter,
  defender: Fighter,
  result: HitResult,
  currentFrame: number
): FightVisualEffect[] {
  const effects: FightVisualEffect[] = [];
  const hitCenterX = (attacker.x + defender.x) / 2;
  const hitCenterY = defender.getWorldY() - 46;

  if (result.type === 'perfect_block') {
    effects.push({
      id: createEffectId('perfect_guard', currentFrame, defender.id),
      preset: 'perfect_guard',
      lane: defender.lane,
      x: defender.x,
      y: defender.getWorldY() - 44,
      ttl: 10,
      totalTtl: 10,
      scale: 1.1,
      color: '#FFFFFF',
      layer: 'front',
      attachedTo: defender.id,
      offsetY: -44,
    });
    return effects;
  }

  if (result.type === 'blocked') {
    effects.push({
      id: createEffectId('block_guard', currentFrame, defender.id),
      preset: 'block_guard',
      lane: defender.lane,
      x: defender.x,
      y: defender.getWorldY() - 40,
      ttl: 8,
      totalTtl: 8,
      scale: 1 + Math.abs(result.knockbackX) * 0.03,
      color: '#00F5FF',
      layer: 'front',
      attachedTo: defender.id,
      offsetY: -40,
    });
    return effects;
  }

  const preset = IMPACT_PRESET_BY_ATTACK[result.attackType];
  const color =
    result.attackType === 'special'
      ? '#39FF14'
      : result.attackType === 'heavy'
        ? '#FF073A'
        : result.attackType === 'medium'
          ? '#FF00FF'
          : '#FFD700';

  effects.push({
    id: createEffectId('hit', currentFrame, defender.id),
    preset,
    lane: defender.lane,
    x: hitCenterX,
    y: hitCenterY,
    ttl: result.attackType === 'light' ? 6 : 8,
    totalTtl: result.attackType === 'light' ? 6 : 8,
    scale: 1 + result.actualDamage * 0.02,
    color,
    layer: 'front',
  });

  if (result.launches) {
    effects.push({
      id: createEffectId('launcher_pop', currentFrame, defender.id),
      preset: 'launcher_pop',
      lane: defender.lane,
      x: defender.x,
      y: defender.getWorldY() - 34,
      ttl: 10,
      totalTtl: 10,
      scale: 1 + Math.abs(result.knockbackY) * 0.08,
      color: '#FFFFFF',
      layer: 'front',
    });
  }

  if (result.attackType === 'special') {
    effects.push({
      id: createEffectId('special_burst', currentFrame, attacker.id),
      preset: 'special_burst',
      lane: attacker.lane,
      x: attacker.x,
      y: attacker.getWorldY() - 54,
      ttl: 12,
      totalTtl: 12,
      scale: 1.15,
      color: '#39FF14',
      layer: 'behind',
      attachedTo: attacker.id,
      offsetY: -54,
    });
  }

  return effects;
}

export function createLandingDustEffect(fighter: Fighter, currentFrame: number): FightVisualEffect {
  return {
    id: createEffectId('landing_dust', currentFrame, fighter.id),
    preset: 'landing_dust',
    lane: fighter.lane,
    x: fighter.x,
    y: fighter.getWorldY() - 4,
    ttl: 9,
    totalTtl: 9,
    scale: 1 + fighter.landingFrames * 0.04,
    color: '#00F5FF',
    layer: 'behind',
    attachedTo: fighter.id,
    offsetY: -4,
  };
}

export function stepFightVisualEffects(
  effects: FightVisualEffect[],
  fighters: Fighter[]
): FightVisualEffect[] {
  const fightersById = new Map(fighters.map((fighter) => [fighter.id, fighter]));

  return effects
    .map((effect) => {
      const ttl = effect.ttl - 1;
      if (ttl <= 0) {
        return null;
      }

      const attached = effect.attachedTo ? fightersById.get(effect.attachedTo) : null;
      if (!attached) {
        return {
          ...effect,
          ttl,
        };
      }

      return {
        ...effect,
        ttl,
        x: attached.x + (effect.offsetX ?? 0),
        y: attached.getWorldY() + (effect.offsetY ?? 0),
        lane: attached.lane,
      };
    })
    .filter((effect): effect is FightVisualEffect => effect !== null);
}
