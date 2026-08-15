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

  it('does not create new melee contacts while the simulation is frozen for hitstop', () => {
    const controller = createFightController();
    const player1 = new Fighter('freeze-p1', 'camus', 1, getCharacter('camus'), 300, 1);
    const player2 = new Fighter('freeze-p2', 'machiavelli', 2, getCharacter('machiavelli'), 340, 1);
    controller.init(player1, player2);

    expect(player1.startAttack(0, 0)).toBe(true);
    const attack = player1.currentAttack;
    if (!attack) throw new Error('Missing attack fixture');
    for (let frame = 1; frame <= attack.startup; frame++) player1.update(1000 / 60, frame);
    expect(player1.getActiveHitbox()).not.toBeNull();

    const state = controller.getState();
    if (!state) throw new Error('Missing fight state');
    state.hitFreezeFrames = 2;
    const healthBefore = player2.health;
    controller.update(1000 / 60, idleInput, idleInput);

    expect(player2.health).toBe(healthBefore);
    expect(state.hitFreezeFrames).toBe(1);
  });
});
