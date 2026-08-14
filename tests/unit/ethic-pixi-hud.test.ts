import { CHARACTERS, getCharacter } from '@/content/characters/character-data';
import { createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { resolveEthicPixiHudModel } from '@/render/ethic-pixi-hud';
import { describe, expect, it } from 'vitest';

describe('Ethic native Pixi HUD model', () => {
  it('derives stable fighter, timer, score and reverse-gauge data from fight state', () => {
    const controller = createFightController();
    controller.init(
      new Fighter('hud-p1', 'camus', 1, getCharacter('camus'), 240, 1),
      new Fighter('hud-p2', 'nietzsche', 2, getCharacter('nietzsche'), 720, 1)
    );
    const state = controller.getState();
    expect(state).not.toBeNull();
    if (!state) throw new Error('fight state was not initialized');
    state.round.time = 9.8;
    state.scores = [1, 0];
    state.combos[0] = { ...state.combos[0], count: 3 };
    const model = resolveEthicPixiHudModel(state);

    expect(model.player1.name).toBe(CHARACTERS.camus.name);
    expect(model.player2.name).toBe(CHARACTERS.nietzsche.name);
    expect(model.player1.reverse).toBe(false);
    expect(model.player2.reverse).toBe(true);
    expect(model.player1.combo).toBe(3);
    expect(model.timerText).toBe('0:09');
    expect(model.timerWarning).toBe(true);
    expect(model.roundNumber).toBe(1);
    expect(model.roundLabel).toBe('ROUND 1');
    expect(model.scores).toEqual([1, 0]);
  });
});
