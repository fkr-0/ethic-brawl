import type { StatusEffectDefinition, StatusEffectId } from '@/content/specials';
import {
  applyTimedEffect,
  hasTimedEffect,
  stepTimedEffects,
  type TimedEffectState,
} from '../../../vendor/arcade-runtime.mjs';

export interface ActiveStatusEffect extends StatusEffectDefinition {
  sourceId: string;
  elapsedFrames: number;
}

type RuntimeStatusEffect = TimedEffectState<StatusEffectId> & ActiveStatusEffect;

function toRuntimeEffect(effect: ActiveStatusEffect): RuntimeStatusEffect {
  const duration = effect.durationFrames + 1;
  const tickInterval = effect.id === 'burn' ? (effect.tickRate ?? 1) : undefined;
  return {
    ...effect,
    kind: effect.id,
    duration,
    remaining: Math.max(0, duration - effect.elapsedFrames),
    stacks: 1,
    maxStacks: 1,
    ...(tickInterval === undefined
      ? {}
      : { tickInterval, tickTimer: tickInterval - (effect.elapsedFrames % tickInterval) }),
  };
}

function fromRuntimeEffect(effect: RuntimeStatusEffect): ActiveStatusEffect {
  return {
    id: effect.id,
    durationFrames: effect.durationFrames,
    magnitude: effect.magnitude,
    ...(effect.tickRate === undefined ? {} : { tickRate: effect.tickRate }),
    sourceId: effect.sourceId ?? '',
    elapsedFrames: Math.max(0, Math.round(effect.duration - effect.remaining)),
  };
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
  const incoming = toRuntimeEffect({ ...definition, sourceId, elapsedFrames: 0 });
  const applied = applyTimedEffect(effects.map(toRuntimeEffect), incoming, {
    match: 'id',
    merge: 'replace',
    position: 'append',
  });
  return applied.effects.map((effect) => fromRuntimeEffect(effect as RuntimeStatusEffect));
}

export function tickStatusEffects(effects: readonly ActiveStatusEffect[]): StatusEffectTickResult {
  let damage = 0;
  let movementMultiplier = 1;
  let canUseCommandSpecials = true;
  let armorHits = 0;
  let reflectsProjectiles = false;

  const stepped = stepTimedEffects(effects.map(toRuntimeEffect), 1);
  const next = stepped.effects.map((effect) => fromRuntimeEffect(effect as RuntimeStatusEffect));

  for (const event of stepped.events) {
    if (event.kind === 'tick' && event.effect.kind === 'burn') {
      damage += event.effect.magnitude;
    }
  }

  for (const effect of next) {
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
  return hasTimedEffect(effects.map(toRuntimeEffect), id, { field: 'kind' });
}
