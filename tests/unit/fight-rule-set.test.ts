import { getCharacter } from '@/content/characters/character-data';
import { getStageOneEncounter } from '@/content/stages/stage-one-vertical-slice';
import { createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

function createFighters() {
  return {
    player1: new Fighter('rules-p1', 'camus', 1, getCharacter('camus'), 240, 1),
    player2: new Fighter('rules-p2', 'machiavelli', 2, getCharacter('machiavelli'), 720, 1),
  };
}

describe('fight rule sets', () => {
  it('applies encounter timer, durability, conviction, and opening cooldown rules', () => {
    const controller = createFightController();
    const { player1, player2 } = createFighters();
    const gateRules = getStageOneEncounter(2).mode.fightRules;
    const baseEnemyHealth = player2.stats.maxHealth;

    controller.init(player1, player2, gateRules);
    const state = controller.getState();
    expect(state).not.toBeNull();
    if (!state) throw new Error('missing fight rule fixture');

    expect(state.rules.id).toBe('gate_judgment');
    expect(state.round.time).toBe(72);
    expect(state.player2.stats.maxHealth).toBe(
      Math.round(baseEnemyHealth * gateRules.player2HealthMultiplier)
    );
    expect(state.player2.specialState.currentEnergy).toBe(state.player2.specialState.maxEnergy);
    expect(state.player1.specialState.currentEnergy).toBe(
      Math.round(state.player1.specialState.maxEnergy * 0.72)
    );
    expect(state.player2.specialCooldown).toBe(0);
    expect(state.player1.specialCooldown).toBeGreaterThan(0);
  });

  it('keeps the selected mode timer when a later round starts', () => {
    const controller = createFightController();
    const { player1, player2 } = createFighters();
    controller.init(player1, player2, getStageOneEncounter(1).mode.fightRules);

    controller.startNextRound();
    expect(controller.getState()?.round.time).toBe(84);
    expect(controller.getState()?.round.number).toBe(2);
  });
});
