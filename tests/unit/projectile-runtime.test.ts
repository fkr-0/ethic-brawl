import { CHARACTERS } from '@/content/characters';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

const emptyInput: PlayerInput = {
  moveLeft: false,
  moveRight: false,
  moveUp: false,
  moveDown: false,
  jump: false,
  jumpPressed: false,
  attack: false,
  attackPressed: false,
  block: false,
  blockPressed: false,
  special: false,
  specialPressed: false,
};

describe('projectile runtime', () => {
  it('resolves projectile hits through fight controller state', () => {
    const controller = createFightController();
    const p1 = new Fighter('p1', 'leibniz', 1, CHARACTERS.leibniz, 0);
    const p2 = new Fighter('p2', 'camus', 2, CHARACTERS.camus, 4);

    controller.init(p1, p2);
    const state = controller.getState();
    expect(state).not.toBeNull();

    state?.projectiles.push({
      id: 'test_projectile',
      definition: {
        id: 'test_projectile_def',
        kind: 'magic_ball',
        speedX: 0,
        speedY: 0,
        accelerationX: 0,
        accelerationY: 0,
        lifetimeFrames: 10,
        pierceCount: 0,
        bounceCount: 0,
        laneBehavior: 'same_lane',
        collision: 'aabb',
        gravityScale: 0,
      },
      ownerId: p1.id,
      x: p2.x,
      y: p2.getWorldY() - 20,
      lane: p2.lane,
      facing: 'right',
      ageFrames: 0,
      remainingPierce: 0,
      reflected: false,
    });

    const before = p2.health;
    controller.update(16, emptyInput, emptyInput);

    expect(p2.health).toBeLessThan(before);
    expect(controller.getState()?.projectiles).toHaveLength(0);
  });
});
