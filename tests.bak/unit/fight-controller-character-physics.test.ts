import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

const neutralInput: PlayerInput = {
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

describe('fight controller character physics integration', () => {
  it('uses agility from character data to scale grounded movement speed', () => {
    const fast = new Fighter('fast', 'machiavelli', 1, getCharacter('machiavelli'), 200, 1);
    const fastDummy = new Fighter('fast-dummy', 'diogenes', 2, getCharacter('diogenes'), 760, 1);
    const fastController = createFightController();
    fastController.init(fast, fastDummy);

    const slow = new Fighter('slow', 'leibniz', 1, getCharacter('leibniz'), 200, 1);
    const slowDummy = new Fighter('slow-dummy', 'diogenes', 2, getCharacter('diogenes'), 760, 1);
    const slowController = createFightController();
    slowController.init(slow, slowDummy);

    fastController.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    slowController.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);

    expect(fast.x).toBeGreaterThan(slow.x);
  });
});
