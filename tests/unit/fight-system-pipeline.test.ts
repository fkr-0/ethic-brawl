import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

const idleInput: PlayerInput = {
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

describe('fight update system pipeline', () => {
  it('runs the full fight frame through the shared ordered phases', () => {
    const controller = createFightController();
    controller.init(
      new Fighter('pipeline-p1', 'camus', 1, getCharacter('camus'), 240, 1),
      new Fighter('pipeline-p2', 'machiavelli', 2, getCharacter('machiavelli'), 720, 1)
    );

    const before = controller.getUpdatePipelineSnapshot();
    controller.update(1000 / 60, idleInput, idleInput);
    const after = controller.getUpdatePipelineSnapshot();

    expect(after.runs).toBe(before.runs + 1);
    expect(after.systems.map((system) => system.name)).toEqual([
      'frame-effects',
      'fighter-statuses',
      'pre-input-hit-freeze',
      'round-clock',
      'fighter-input',
      'special-spawns',
      'melee-contacts',
      'projectile-step',
      'projectile-contacts',
      'field-step',
      'combo-step',
      'round-end',
      'post-combat-hit-freeze',
      'fighter-physics',
      'presentation-drain',
      'auto-face',
    ]);
    expect(controller.getState()?.frameCount).toBe(1);
  });
});
