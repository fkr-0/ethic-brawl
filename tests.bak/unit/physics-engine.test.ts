import { getCharacter } from '@/content/characters/character-data';
import { type HitResult, resolveHit } from '@/game/fight/combat';
import { Fighter } from '@/game/fight/fighter';
import { calculateLaneTransition, getLaneY } from '@/game/physics/lanes';
import { applyAirControl } from '@/game/physics/movement';
import { describe, expect, it } from 'vitest';

function toCombatState(fighter: Fighter) {
  return {
    x: fighter.x,
    y: fighter.getWorldY(),
    lane: fighter.lane,
    health: fighter.health,
    maxHealth: fighter.stats.maxHealth,
    stats: fighter.stats,
    state: fighter.state,
    stateFrame: fighter.stateFrame,
    facing: fighter.facing,
    velocityX: fighter.velocityX,
    velocityY: fighter.velocityY,
    isGrounded: fighter.isGrounded,
    isBlocking: fighter.isBlocking,
    blockStartedFrame: fighter.blockStartedFrame,
    hitstunFrames: fighter.hitstunFrames,
    combo: fighter.combo,
    currentAttackId: fighter.currentAttack?.id ?? null,
    attackFrame: fighter.attackFrame,
  };
}

describe('physics and lane integration', () => {
  it('caps air control to the configured walk speed', () => {
    expect(applyAirControl(5, 1, 4)).toBe(4);
    expect(applyAirControl(-5, -1, 4)).toBe(-4);
  });

  it('clamps lane transition progress to the source and target lanes', () => {
    expect(calculateLaneTransition(0, 2, -1)).toBe(getLaneY(0));
    expect(calculateLaneTransition(0, 2, 2)).toBe(getLaneY(2));
  });

  it('uses lane ground height in fighter world coordinates', () => {
    const front = new Fighter('front', 'camus', 1, getCharacter('camus'), 200, 0);
    const back = new Fighter('back', 'diogenes', 2, getCharacter('diogenes'), 200, 2);

    expect(front.getGroundY()).toBe(getLaneY(0));
    expect(back.getGroundY()).toBe(getLaneY(2));
    expect(front.getWorldY()).toBeGreaterThan(back.getWorldY());
  });

  it('prevents a grounded attack from hitting an opponent in a different lane', () => {
    const attacker = new Fighter('attacker', 'camus', 1, getCharacter('camus'), 200, 0);
    const defender = new Fighter('defender', 'diogenes', 2, getCharacter('diogenes'), 200, 2);

    attacker.startAttack(0);
    if (!attacker.currentAttack) {
      throw new Error('expected currentAttack to exist after starting an attack');
    }
    attacker.attackFrame = attacker.currentAttack.startup;

    const hitbox = attacker.getActiveHitbox();
    if (!hitbox) {
      throw new Error('expected active hitbox during startup-complete active frame');
    }

    const result: HitResult = resolveHit(
      toCombatState(attacker),
      toCombatState(defender),
      hitbox,
      defender.getHurtbox(),
      1
    );

    expect(result.type).toBe('miss');
  });
});
