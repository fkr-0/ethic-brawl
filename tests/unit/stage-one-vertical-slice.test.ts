import {
  STAGE_ONE,
  STAGE_ONE_COMBAT_MODES,
  STAGE_ONE_ENCOUNTERS,
  getStageOneEncounter,
  isFinalStageOneEncounter,
} from '@/content/stages/stage-one-vertical-slice';
import { describe, expect, it } from 'vitest';

describe('Babylon Stage 1 vertical slice', () => {
  it('covers every authored Babylon wave with a playable representative encounter', () => {
    expect(STAGE_ONE.id).toBe('babylon');
    expect(STAGE_ONE_ENCOUNTERS).toHaveLength(STAGE_ONE.waves.length);
    expect(STAGE_ONE_ENCOUNTERS.map(({ wave }) => wave)).toEqual([1, 2, 3]);
    expect(STAGE_ONE_ENCOUNTERS.map(({ enemyCharacterId }) => enemyCharacterId)).toEqual([
      'socrates',
      'schmitt',
      'machiavelli',
    ]);
    expect(STAGE_ONE_ENCOUNTERS.map(({ aiDifficulty }) => aiDifficulty)).toEqual([
      'easy',
      'medium',
      'hard',
    ]);
    expect(STAGE_ONE_ENCOUNTERS.map(({ mode }) => mode.id)).toEqual([
      'market_procession',
      'archive_lockdown',
      'gate_judgment',
    ]);
    expect(STAGE_ONE_COMBAT_MODES.map(({ fightRules }) => fightRules.roundTimeSeconds)).toEqual([
      99, 84, 72,
    ]);
    expect(STAGE_ONE_COMBAT_MODES[2]?.fightRules.player2HealthMultiplier).toBeGreaterThan(1);

    for (const encounter of STAGE_ONE_ENCOUNTERS) {
      expect(encounter.enemyArchetypes).toEqual(STAGE_ONE.waves[encounter.index]?.enemies);
      expect(encounter.note).toBe(STAGE_ONE.waves[encounter.index]?.note);
    }
  });

  it('resolves encounter boundaries safely', () => {
    expect(getStageOneEncounter(1).wave).toBe(2);
    expect(getStageOneEncounter(99).wave).toBe(1);
    expect(isFinalStageOneEncounter(1)).toBe(false);
    expect(isFinalStageOneEncounter(2)).toBe(true);
  });
});
