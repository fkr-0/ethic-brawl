import { CHARACTERS } from '@/content/characters';
import { getSpecialByCommandSlot } from '@/content/specials';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { spawnField } from '@/game/specials/field-system';
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

describe('field runtime', () => {
  it('ticks fields through fight controller state and applies status effects', () => {
    const controller = createFightController();
    const p1 = new Fighter('p1', 'camus', 1, CHARACTERS.camus, 100);
    const p2 = new Fighter('p2', 'diogenes', 2, CHARACTERS.diogenes, 120);
    controller.init(p1, p2);

    const fieldMove = getSpecialByCommandSlot('camus', 'BDJ');
    const field = fieldMove?.field;
    const state = controller.getState();
    expect(fieldMove).toBeDefined();
    expect(field).toBeDefined();
    expect(state).not.toBeNull();
    if (!fieldMove || !field || !state) {
      throw new Error('Missing field runtime fixture');
    }

    state.fields.push(
      spawnField(
        field,
        p1.id,
        fieldMove.id,
        p2.x,
        p2.getWorldY() - 48,
        p2.lane,
        3,
        fieldMove.statusEffects ?? []
      )
    );

    const before = p2.health;
    for (let i = 0; i < field.tickRate; i += 1) {
      controller.update(16, emptyInput, emptyInput);
    }

    expect(p2.health).toBe(before - 3);
    expect(p2.statusEffects.some((effect) => effect.id === 'slow')).toBe(true);
    expect(controller.getState()?.fields).toHaveLength(1);
  });
});
