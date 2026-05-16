import type { StatusEffectDefinition, StatusEffectId } from '@/content/specials';

export interface ActiveStatusEffect extends StatusEffectDefinition {
  sourceId: string;
  elapsedFrames: number;
}

export interface StatusEffectTickResult {
  effects: ActiveStatusEffect[];
  damage: number;
  movementMultiplier: number;
  canUseCommandSpecials: boolean;
  armorHits: number;
  reflectsProjectiles: boolean;
}

export function applyStatusEffect(
  effects: readonly ActiveStatusEffect[],
  definition: StatusEffectDefinition,
  sourceId: string
): ActiveStatusEffect[] {
  return [
    ...effects.filter((effect) => effect.id !== definition.id),
    { ...definition, sourceId, elapsedFrames: 0 },
  ];
}

export function tickStatusEffects(effects: readonly ActiveStatusEffect[]): StatusEffectTickResult {
  let damage = 0;
  let movementMultiplier = 1;
  let canUseCommandSpecials = true;
  let armorHits = 0;
  let reflectsProjectiles = false;

  const next = effects
    .map((effect) => ({ ...effect, elapsedFrames: effect.elapsedFrames + 1 }))
    .filter((effect) => effect.elapsedFrames <= effect.durationFrames);

  for (const effect of next) {
    if (effect.id === 'burn' && shouldTick(effect)) damage += effect.magnitude;
    if (effect.id === 'freeze' || effect.id === 'slow')
      movementMultiplier *= Math.max(0.1, 1 - effect.magnitude);
    if (effect.id === 'silence') canUseCommandSpecials = false;
    if (effect.id === 'armor') armorHits += effect.magnitude;
    if (effect.id === 'reflect') reflectsProjectiles = true;
  }

  return {
    effects: next,
    damage,
    movementMultiplier,
    canUseCommandSpecials,
    armorHits,
    reflectsProjectiles,
  };
}

export function hasStatusEffect(
  effects: readonly ActiveStatusEffect[],
  id: StatusEffectId
): boolean {
  return effects.some((effect) => effect.id === id);
}

function shouldTick(effect: ActiveStatusEffect): boolean {
  return effect.tickRate === undefined || effect.elapsedFrames % effect.tickRate === 0;
}
