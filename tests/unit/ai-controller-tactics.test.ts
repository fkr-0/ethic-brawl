import {
  getCharacter,
  getCharacterIds,
  getCharacterNormalChain,
} from '@/content/characters/character-data';
import { AI_DIFFICULTY_CONFIG, createAIController, type AIConfig } from '@/game/ai/ai-controller';
import { createFightController, Fighter, type FightRuleSet, type PlayerInput } from '@/game/fight';
import { describe, expect, it } from 'vitest';

const EMPTY_INPUT: PlayerInput = {
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

const LONG_TRAINING_RULES: FightRuleSet = {
  id: 'ai_combo_training',
  label: 'AI Combo Training',
  roundTimeSeconds: 120,
  player1StartEnergyRatio: 1,
  player2StartEnergyRatio: 1,
  player1StartSpecialCooldownRatio: 0,
  player2StartSpecialCooldownRatio: 0,
  player1HealthMultiplier: 8,
  player2HealthMultiplier: 8,
};

const COMBO_TEST_CONFIG: AIConfig = {
  ...AI_DIFFICULTY_CONFIG.hard,
  reactionTime: 0,
  aggressiveness: 1,
  blockChance: 0,
  specialUsage: 0,
  comboAbility: 1,
  optimalRange: 72,
  retreatThreshold: 0,
};

describe('tactical AI controller', () => {
  it('scales defensive reliability with difficulty instead of granting universal reads', () => {
    expect(AI_DIFFICULTY_CONFIG.easy.defenseChance).toBeLessThan(
      AI_DIFFICULTY_CONFIG.medium.defenseChance
    );
    expect(AI_DIFFICULTY_CONFIG.medium.defenseChance).toBeLessThan(
      AI_DIFFICULTY_CONFIG.hard.defenseChance
    );
  });

  it('cycles every authored normal in every coded fighter chain', () => {
    const failures: string[] = [];

    for (const characterId of getCharacterIds()) {
      const character = getCharacter(characterId);
      const targetCharacter = getCharacter(characterId === 'socrates' ? 'camus' : 'socrates');
      const fighter = new Fighter('p1', characterId, 1, character, 430, 1);
      const target = new Fighter('p2', targetCharacter.id, 2, targetCharacter, 500, 1);
      const controller = createFightController();
      const ai = createAIController(COMBO_TEST_CONFIG);
      controller.init(fighter, target, LONG_TRAINING_RULES);

      const expected = getCharacterNormalChain(character).map(({ id }) => id);
      const seen = new Set<string>();

      for (let frame = 0; frame < 720 && seen.size < expected.length; frame++) {
        const state = controller.getState();
        if (!state?.round.isActive) break;
        if (state.player1.currentAttack?.type !== 'special') {
          const attackId = state.player1.currentAttack?.id;
          if (attackId) seen.add(attackId);
        }
        const aiInput = ai.update(state.player1, state.player2, state.frameCount + 1);
        controller.update(1000 / 60, aiInput, EMPTY_INPUT);
      }

      const missing = expected.filter((attackId) => !seen.has(attackId));
      if (missing.length > 0) failures.push(`${characterId}: ${missing.join(', ')}`);
    }

    expect(failures).toEqual([]);
  });

  it('cycles all directional command slots instead of repeating one special', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 430, 1);
    const target = new Fighter('p2', 'socrates', 2, getCharacter('socrates'), 500, 1);
    const ai = createAIController({
      ...AI_DIFFICULTY_CONFIG.hard,
      reactionTime: 0,
      aggressiveness: 0,
      blockChance: 0,
      specialUsage: 1,
      comboAbility: 0,
      retreatThreshold: 0,
    });
    const seen = new Set<string>();

    for (let frame = 1; frame <= 100; frame++) {
      ai.update(fighter, target, frame);
      const diagnostics = ai.getDiagnostics();
      if (diagnostics.currentAction === 'command_special') {
        seen.add(diagnostics.activeCommandSlot);
      }
    }

    expect([...seen].sort()).toEqual(
      ['BFA', 'BBA', 'BUA', 'BDA', 'BFJ', 'BBJ', 'BUJ', 'BDJ'].sort()
    );
  });

  it('respects authored reaction latency before defending against a close attack', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 430, 1);
    const target = new Fighter('p2', 'socrates', 2, getCharacter('socrates'), 480, 1);
    target.setState('attacking');
    const ai = createAIController({ ...AI_DIFFICULTY_CONFIG.medium, defenseChance: 1 });

    const firstInput = ai.update(fighter, target, 1);
    expect(ai.getCurrentAction()).toBe('idle');
    expect(
      firstInput.block ||
        firstInput.moveUp ||
        firstInput.moveDown ||
        firstInput.moveLeft ||
        firstInput.moveRight
    ).toBe(false);

    let reacted = false;
    for (let frame = 2; frame <= 1 + AI_DIFFICULTY_CONFIG.medium.reactionTime; frame++) {
      const input = ai.update(fighter, target, frame);
      reacted ||=
        ['block', 'evade_lane'].includes(ai.getCurrentAction()) &&
        (input.block || input.moveUp || input.moveDown || input.moveLeft || input.moveRight);
    }

    expect(reacted).toBe(true);
  });

  it('prevents command specials from starving during a readable close-range fight', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 430, 1);
    const target = new Fighter('p2', 'socrates', 2, getCharacter('socrates'), 492, 1);
    const ai = createAIController({
      ...AI_DIFFICULTY_CONFIG.medium,
      reactionTime: 0,
      aggressiveness: 0,
      blockChance: 0,
      specialUsage: 0,
      comboAbility: 0,
      retreatThreshold: 0,
    });
    let firstSpecialFrame: number | null = null;

    for (let frame = 1; frame <= 240; frame++) {
      ai.update(fighter, target, frame);
      if (ai.getCurrentAction() === 'command_special') {
        firstSpecialFrame = frame;
        break;
      }
    }

    expect(firstSpecialFrame).not.toBeNull();
    expect(firstSpecialFrame).toBeGreaterThanOrEqual(180);
    expect(firstSpecialFrame).toBeLessThanOrEqual(190);
  });
});
