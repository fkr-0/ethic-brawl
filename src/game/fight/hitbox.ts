/**
 * Hitbox and hurtbox utilities
 */

import type { AABB, Vector2 } from '@/utils/math';
import { resolveHitboxContacts } from '../../../vendor/arcade-runtime.mjs';
import type { AttackData } from './fighter-state';
import { resolveAttackMoveClass } from './move-class-presets';

/**
 * Hitbox type
 */
export type HitboxType = 'hitbox' | 'hurtbox';

/**
 * Hitbox configuration
 */
export interface HitboxConfig {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

/**
 * Active hitbox data
 */
export interface ActiveHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitstun: number;
  type: 'light' | 'medium' | 'heavy' | 'special';
  owner: string;
  moveClass: ReturnType<typeof resolveAttackMoveClass>;
}

/**
 * Create a hitbox relative to a position
 */
export function createHitbox(
  x: number,
  y: number,
  config: HitboxConfig,
  facing: 'left' | 'right'
): AABB {
  const offsetX = facing === 'right' ? config.offsetX : -config.offsetX - config.width;
  return {
    x: x + offsetX,
    y: y + config.offsetY,
    width: config.width,
    height: config.height,
  };
}

/**
 * Default hurtbox configuration
 */
export const DEFAULT_HURTBOX: HitboxConfig = {
  offsetX: -25,
  offsetY: -80,
  width: 50,
  height: 80,
};

/**
 * Default hitbox configurations for attacks
 */
export const ATTACK_HITBOXES: Record<string, HitboxConfig> = {
  attack_1: {
    offsetX: 25,
    offsetY: -60,
    width: 40,
    height: 30,
  },
  attack_2: {
    offsetX: 30,
    offsetY: -55,
    width: 45,
    height: 25,
  },
  attack_3: {
    offsetX: 20,
    offsetY: -65,
    width: 50,
    height: 40,
  },
  special: {
    offsetX: 0,
    offsetY: -40,
    width: 100,
    height: 80,
  },
};

const FALLBACK_ATTACK_HITBOX: HitboxConfig = {
  offsetX: 0,
  offsetY: 0,
  width: 0,
  height: 0,
};

/**
 * Check if a hitbox intersects with a hurtbox
 */
export function checkHit(hitbox: AABB, hurtbox: AABB): boolean {
  return (
    resolveHitboxContacts({
      hitboxes: [{ id: 'hitbox', ownerId: 'attacker', ...hitbox }],
      hurtboxes: [{ id: 'hurtbox', actorId: 'target', ...hurtbox }],
    }).length > 0
  );
}

/**
 * Get the center of a hitbox
 */
export function getHitboxCenter(hitbox: AABB): Vector2 {
  return {
    x: hitbox.x + hitbox.width / 2,
    y: hitbox.y + hitbox.height / 2,
  };
}

/**
 * Expand a hitbox by a margin
 */
export function expandHitbox(hitbox: AABB, margin: number): AABB {
  return {
    x: hitbox.x - margin,
    y: hitbox.y - margin,
    width: hitbox.width + margin * 2,
    height: hitbox.height + margin * 2,
  };
}

/**
 * Create an active hitbox from attack data
 */
export function createActiveHitbox(
  owner: string,
  position: Vector2,
  facing: 'left' | 'right',
  attack: Pick<
    AttackData,
    | 'id'
    | 'damage'
    | 'knockbackX'
    | 'knockbackY'
    | 'hitstun'
    | 'type'
    | 'hitbox'
    | 'moveClass'
    | 'moveClassPreset'
  >
): ActiveHitbox {
  const config =
    attack.hitbox ??
    ATTACK_HITBOXES[attack.id] ??
    ATTACK_HITBOXES.attack_1 ??
    FALLBACK_ATTACK_HITBOX;
  const aabb = createHitbox(position.x, position.y, config, facing);

  // Apply facing to knockback
  const kx = facing === 'right' ? attack.knockbackX : -attack.knockbackX;

  return {
    ...aabb,
    damage: attack.damage,
    knockbackX: kx,
    knockbackY: attack.knockbackY,
    hitstun: attack.hitstun,
    type: attack.type,
    owner,
    moveClass: resolveAttackMoveClass(attack),
  };
}
