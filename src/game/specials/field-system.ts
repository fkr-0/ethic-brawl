import type { FieldDefinition, StatusEffectDefinition } from '@/content/specials';

export interface FieldState {
  id: string;
  definition: FieldDefinition;
  ownerId: string;
  sourceMoveId: string;
  x: number;
  y: number;
  lane: number;
  ageFrames: number;
  damagePerTick: number;
  statusEffects: readonly StatusEffectDefinition[];
  hitTargetIdsThisTick: string[];
}

export interface FieldTarget {
  id: string;
  x: number;
  y: number;
  lane: number;
  width: number;
  height: number;
  ownerId?: string;
}

export function spawnField(
  definition: FieldDefinition,
  ownerId: string,
  sourceMoveId: string,
  x: number,
  y: number,
  lane: number,
  damagePerTick: number,
  statusEffects: readonly StatusEffectDefinition[] = []
): FieldState {
  return {
    id: `${definition.id}_${ownerId}_${sourceMoveId}`,
    definition,
    ownerId,
    sourceMoveId,
    x,
    y,
    lane,
    ageFrames: 0,
    damagePerTick,
    statusEffects,
    hitTargetIdsThisTick: [],
  };
}

export function updateField(
  field: FieldState,
  caster?: { x: number; y: number; lane: number }
): FieldState | null {
  const ageFrames = field.ageFrames + 1;
  if (ageFrames > field.definition.durationFrames) {
    return null;
  }

  return {
    ...field,
    ageFrames,
    x: field.definition.followsCaster && caster ? caster.x : field.x,
    y: field.definition.followsCaster && caster ? caster.y : field.y,
    lane: field.definition.followsCaster && caster ? caster.lane : field.lane,
    hitTargetIdsThisTick: isFieldTickFrame({ ...field, ageFrames })
      ? []
      : field.hitTargetIdsThisTick,
  };
}

export function isFieldTickFrame(field: Pick<FieldState, 'ageFrames' | 'definition'>): boolean {
  return field.ageFrames > 0 && field.ageFrames % field.definition.tickRate === 0;
}

export function fieldHitsTarget(field: FieldState, target: FieldTarget): boolean {
  if (target.ownerId === field.ownerId) return false;
  if (target.lane !== field.lane) return false;
  if (field.hitTargetIdsThisTick.includes(target.id)) return false;

  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;
  const distanceSquared = (targetCenterX - field.x) ** 2 + (targetCenterY - field.y) ** 2;
  return distanceSquared <= field.definition.radius ** 2;
}

export function registerFieldHit(field: FieldState, targetId: string): FieldState {
  return {
    ...field,
    hitTargetIdsThisTick: [...field.hitTargetIdsThisTick, targetId],
  };
}
