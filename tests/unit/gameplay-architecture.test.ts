import { getItem } from '@/content/items';
import type { ProjectileDefinition } from '@/content/specials';
import {
  applyHitzoneMultipliers,
  buildDefaultHitzones,
  resolveHitzone,
} from '@/game/fight/hitzones';
import {
  MELEE_ATTACK_LIBRARY,
  applyWeaponEffectToAttack,
  attackDataFromMelee,
  getWeaponEffect,
} from '@/game/fight/melee-architecture';
import { resolveItemAction, updateThrownItem } from '@/game/items';
import { spawnProjectile, updateSeekingProjectile } from '@/game/specials';
import {
  TRAINING_STAGE,
  canJumpOnObstacle,
  nearestItemSpawn,
  resolveStageMovement,
} from '@/game/stages';
import { describe, expect, it } from 'vitest';

describe('modular gameplay architecture', () => {
  it('resolves hitzones and applies zone damage multipliers', () => {
    const hurtbox = { x: 100, y: 100, width: 50, height: 100 };
    const zones = buildDefaultHitzones(hurtbox);
    const headZone = resolveHitzone({ x: 110, y: 105, width: 20, height: 15 }, zones);
    const legsZone = resolveHitzone({ x: 110, y: 180, width: 20, height: 15 }, zones);

    expect(headZone).toBe('head');
    expect(legsZone).toBe('legs');
    expect(
      applyHitzoneMultipliers(headZone, { damage: 20, hitstun: 10, knockbackX: 4, knockbackY: 2 })
        .damage
    ).toBeGreaterThan(20);
    expect(
      applyHitzoneMultipliers(legsZone, { damage: 20, hitstun: 10, knockbackX: 4, knockbackY: 2 })
        .damage
    ).toBeLessThan(20);
  });

  it('builds modular melee attacks and applies sword/bat/mace weapon effects', () => {
    const sword = getWeaponEffect(getItem('rusted_short_sword'));
    const bat = getWeaponEffect(getItem('street_argument_bat'));
    const mace = getWeaponEffect(getItem('civic_mace'));
    const swordSlash = MELEE_ATTACK_LIBRARY.sword_slash;
    const unarmedJab = MELEE_ATTACK_LIBRARY.unarmed_jab;
    if (!swordSlash || !unarmedJab) {
      throw new Error('expected melee attack presets to exist');
    }
    const base = attackDataFromMelee(swordSlash);

    expect(base.hitbox?.width).toBeGreaterThan(unarmedJab.hitbox.width);
    expect(applyWeaponEffectToAttack(base, sword).damage).toBe(base.damage + 4);
    expect(applyWeaponEffectToAttack(base, bat).hitstun).toBe(base.hitstun + 2);
    expect(applyWeaponEffectToAttack(base, mace).hitstun).toBe(base.hitstun + 3);
  });

  it('supports finite stages, platforms, jumpable obstacles, and item spawn lookup', () => {
    const previous = { x: 460, y: 330, width: 40, height: 60, velocityX: 0, velocityY: 12 };
    const body = { ...previous, y: 392 };
    const result = resolveStageMovement(body, previous, TRAINING_STAGE);

    const crate = TRAINING_STAGE.obstacles[0];
    if (!crate) {
      throw new Error('expected training stage crate obstacle to exist');
    }
    expect(result.grounded).toBe(true);
    expect(result.standingOnId).toBe('crate_mid');
    expect(canJumpOnObstacle(result.body, crate)).toBe(true);
    expect(nearestItemSpawn(TRAINING_STAGE, { x: 475, y: 290 })).toEqual({ x: 480, y: 300 });
  });

  it('resolves pickup, equip, consume, use, and throw item actions', () => {
    const sword = getItem('rusted_short_sword');
    const potion = getItem('life_potion_small');
    const worldItem = {
      id: 'w1',
      itemId: potion.id,
      x: 10,
      y: 20,
      lane: 1,
      quantity: 1,
      velocityX: 0,
      velocityY: 0,
    };

    expect(
      resolveItemAction({ kind: 'pickup', actorId: 'p1', item: potion, worldItem }).removesWorldItem
    ).toBe(true);
    expect(resolveItemAction({ kind: 'equip', actorId: 'p1', item: sword }).equipsWeapon).toBe(
      true
    );
    expect(
      resolveItemAction({ kind: 'consume', actorId: 'p1', item: potion }).consumedInventoryItem
    ).toBe(true);

    const thrown = resolveItemAction({
      kind: 'throw',
      actorId: 'p1',
      item: potion,
      worldItem,
      facing: 'right',
    }).thrownItem;
    if (!thrown) {
      throw new Error('expected throw action to create a thrown world item');
    }
    expect(thrown.velocityX).toBeGreaterThan(0);
    expect(updateThrownItem(thrown).y).toBeLessThan(thrown.y);
  });

  it('updates seeking projectiles toward the nearest target', () => {
    const def: ProjectileDefinition = {
      id: 'test_seeker',
      kind: 'magic_ball',
      speedX: 2,
      speedY: 0,
      accelerationX: 0,
      accelerationY: 0,
      lifetimeFrames: 60,
      pierceCount: 0,
      bounceCount: 0,
      laneBehavior: 'same_lane',
      collision: 'aabb',
      gravityScale: 0,
      homingStrength: 0.5,
    };
    const projectile = spawnProjectile(def, 'p1', 0, 0, 1, 'right');
    const updated = updateSeekingProjectile(projectile, [
      { id: 'p2', ownerId: 'p2', x: 80, y: 20, width: 20, height: 40, lane: 1 },
    ]);

    expect(updated?.x).toBeGreaterThan(2);
    expect(updated?.y).toBeGreaterThan(0);
  });
});
