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

function stepFight(
  controller: ReturnType<typeof createFightController>,
  frames: number,
  input1: PlayerInput = neutralInput,
  input2: PlayerInput = neutralInput
): void {
  for (let frame = 0; frame < frames; frame++) {
    controller.update(16.667, input1, input2);
  }
}

describe('attack presentation', () => {
  it('fires authored per-move camera and vfx cues during an attack timeline', () => {
    const player1 = new Fighter('p1', 'machiavelli', 1, getCharacter('machiavelli'), 320, 1);
    const player2 = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 420, 1);
    const controller = createFightController();
    controller.init(player1, player2);

    player1.startAttack(2);
    stepFight(controller, 4);

    const state = controller.getState();

    expect(state?.visualEffects.some((effect) => effect.preset === 'swing_arc_heavy')).toBe(true);
    expect(state?.cameraEffects.some((effect) => effect.shake >= 4)).toBe(true);
  });
});
