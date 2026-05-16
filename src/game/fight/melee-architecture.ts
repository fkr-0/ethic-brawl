import type { ItemDefinition, WeaponItemEffect } from '@/game/items/item-system';
import type { AttackData, AttackType } from './fighter-state';

export type MeleeAttackFamily = 'unarmed' | 'sword' | 'bat' | 'mace' | 'staff' | 'improvised';
export type MeleeAttackShape = 'jab' | 'slash' | 'thrust' | 'swing' | 'uppercut' | 'slam' | 'sweep';

export interface MeleeAttackDefinition {
  id: string;
  name: string;
  family: MeleeAttackFamily;
  shape: MeleeAttackShape;
  type: Exclude<AttackType, 'special'>;
  damage: number;
  hitstun: number;
  knockbackX: number;
  knockbackY: number;
  range: number;
  startup: number;
  active: number;
  recovery: number;
  hitbox: { offsetX: number; offsetY: number; width: number; height: number };
  tags: readonly string[];
}

export const MELEE_ATTACK_LIBRARY: Record<string, MeleeAttackDefinition> = {
  unarmed_jab: {
    id: 'unarmed_jab',
    name: 'Unarmed Jab',
    family: 'unarmed',
    shape: 'jab',
    type: 'light',
    damage: 8,
    hitstun: 12,
    knockbackX: 2,
    knockbackY: 0,
    range: 56,
    startup: 5,
    active: 4,
    recovery: 11,
    hitbox: { offsetX: 24, offsetY: -58, width: 36, height: 28 },
    tags: ['starter', 'fast'],
  },
  sword_slash: {
    id: 'sword_slash',
    name: 'Sword Slash',
    family: 'sword',
    shape: 'slash',
    type: 'medium',
    damage: 12,
    hitstun: 15,
    knockbackX: 3.5,
    knockbackY: 0,
    range: 78,
    startup: 7,
    active: 5,
    recovery: 15,
    hitbox: { offsetX: 26, offsetY: -64, width: 68, height: 36 },
    tags: ['weapon', 'blade', 'reach'],
  },
  bat_swing: {
    id: 'bat_swing',
    name: 'Bat Swing',
    family: 'bat',
    shape: 'swing',
    type: 'heavy',
    damage: 15,
    hitstun: 20,
    knockbackX: 7,
    knockbackY: 2,
    range: 74,
    startup: 9,
    active: 6,
    recovery: 21,
    hitbox: { offsetX: 18, offsetY: -68, width: 76, height: 42 },
    tags: ['weapon', 'blunt', 'knockback'],
  },
  mace_slam: {
    id: 'mace_slam',
    name: 'Mace Slam',
    family: 'mace',
    shape: 'slam',
    type: 'heavy',
    damage: 17,
    hitstun: 24,
    knockbackX: 5,
    knockbackY: 3,
    range: 64,
    startup: 10,
    active: 7,
    recovery: 23,
    hitbox: { offsetX: 20, offsetY: -72, width: 60, height: 50 },
    tags: ['weapon', 'blunt', 'stagger'],
  },
};

export function attackDataFromMelee(def: MeleeAttackDefinition): AttackData {
  return {
    id: def.id,
    name: def.name,
    damage: def.damage,
    hitstun: def.hitstun,
    knockbackX: def.knockbackX,
    knockbackY: def.knockbackY,
    range: def.range,
    startup: def.startup,
    active: def.active,
    recovery: def.recovery,
    type: def.type,
    hitbox: def.hitbox,
  };
}

export function applyWeaponEffectToAttack(
  attack: AttackData,
  weapon: WeaponItemEffect | null
): AttackData {
  if (!weapon) return attack;
  const speedScale = 1 - weapon.speedModifier / 100;
  return {
    ...attack,
    damage: attack.damage + weapon.damageBonus,
    hitstun: attack.hitstun + weapon.hitstunBonus,
    startup: Math.max(1, Math.round(attack.startup * speedScale)),
    recovery: Math.max(1, Math.round(attack.recovery * speedScale)),
  };
}

export function getWeaponEffect(item: ItemDefinition | null): WeaponItemEffect | null {
  return item?.effect.type === 'weapon' ? item.effect : null;
}
