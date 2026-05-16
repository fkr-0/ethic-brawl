import type { AABB } from '@/utils/math';

export type HitzoneId = 'head' | 'torso' | 'legs' | 'weapon' | 'environment';

export interface HitzoneDefinition {
  id: HitzoneId;
  label: string;
  damageMultiplier: number;
  hitstunMultiplier: number;
  knockbackMultiplier: number;
}

export interface HitzoneBox extends AABB {
  zone: HitzoneId;
}

export const HITZONE_DEFINITIONS: Record<HitzoneId, HitzoneDefinition> = {
  head: {
    id: 'head',
    label: 'Head',
    damageMultiplier: 1.25,
    hitstunMultiplier: 1.1,
    knockbackMultiplier: 1.05,
  },
  torso: {
    id: 'torso',
    label: 'Torso',
    damageMultiplier: 1,
    hitstunMultiplier: 1,
    knockbackMultiplier: 1,
  },
  legs: {
    id: 'legs',
    label: 'Legs',
    damageMultiplier: 0.85,
    hitstunMultiplier: 0.9,
    knockbackMultiplier: 0.85,
  },
  weapon: {
    id: 'weapon',
    label: 'Weapon / Guard',
    damageMultiplier: 0.65,
    hitstunMultiplier: 0.75,
    knockbackMultiplier: 0.7,
  },
  environment: {
    id: 'environment',
    label: 'Environment',
    damageMultiplier: 1,
    hitstunMultiplier: 1,
    knockbackMultiplier: 1,
  },
};

export interface HitzoneAdjustedImpact {
  zone: HitzoneId;
  damage: number;
  hitstun: number;
  knockbackX: number;
  knockbackY: number;
}

export function buildDefaultHitzones(hurtbox: AABB): HitzoneBox[] {
  const headHeight = Math.round(hurtbox.height * 0.28);
  const torsoHeight = Math.round(hurtbox.height * 0.44);
  const legsHeight = hurtbox.height - headHeight - torsoHeight;
  return [
    { zone: 'head', x: hurtbox.x, y: hurtbox.y, width: hurtbox.width, height: headHeight },
    {
      zone: 'torso',
      x: hurtbox.x,
      y: hurtbox.y + headHeight,
      width: hurtbox.width,
      height: torsoHeight,
    },
    {
      zone: 'legs',
      x: hurtbox.x,
      y: hurtbox.y + headHeight + torsoHeight,
      width: hurtbox.width,
      height: legsHeight,
    },
  ];
}

function areaOverlap(a: AABB, b: AABB): number {
  const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return x * y;
}

export function resolveHitzone(hitbox: AABB, zones: readonly HitzoneBox[]): HitzoneId {
  let best: { zone: HitzoneId; area: number } = { zone: 'torso', area: 0 };
  for (const zone of zones) {
    const area = areaOverlap(hitbox, zone);
    if (area > best.area) best = { zone: zone.zone, area };
  }
  return best.zone;
}

export function applyHitzoneMultipliers(
  zone: HitzoneId,
  impact: { damage: number; hitstun: number; knockbackX: number; knockbackY: number }
): HitzoneAdjustedImpact {
  const def = HITZONE_DEFINITIONS[zone];
  return {
    zone,
    damage: Math.max(1, Math.round(impact.damage * def.damageMultiplier)),
    hitstun: Math.max(0, Math.round(impact.hitstun * def.hitstunMultiplier)),
    knockbackX: impact.knockbackX * def.knockbackMultiplier,
    knockbackY: impact.knockbackY * def.knockbackMultiplier,
  };
}
