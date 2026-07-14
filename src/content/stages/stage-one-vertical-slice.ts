import type { CharacterId } from '@/content/characters/character-data';
import type { AIDifficulty } from '@/game/ai/ai-controller';
import type { FightRuleSet } from '@/game/fight/fight-controller';
import { STORY_STAGES } from './story-stage-data';

export type StageOneModeId = 'market_procession' | 'archive_lockdown' | 'gate_judgment';

export interface StageOneCombatMode {
  id: StageOneModeId;
  label: string;
  description: string;
  ruleSummary: string;
  fightRules: FightRuleSet;
}

export interface StageOneEncounter {
  index: number;
  wave: number;
  enemyCharacterId: CharacterId;
  enemyArchetypes: readonly string[];
  note: string;
  title: string;
  aiDifficulty: AIDifficulty;
  mode: StageOneCombatMode;
}

export const STAGE_ONE = STORY_STAGES.babylon;

export const STAGE_ONE_COMBAT_MODES: readonly StageOneCombatMode[] = [
  {
    id: 'market_procession',
    label: 'Market Procession',
    description: 'A long public opening where both sides can read the crowd before committing.',
    ruleSummary: '99 seconds · lighter examiner · delayed enemy special',
    fightRules: {
      id: 'market_procession',
      label: 'Market Procession',
      roundTimeSeconds: 99,
      player1StartEnergyRatio: 1,
      player2StartEnergyRatio: 0.65,
      player1StartSpecialCooldownRatio: 0,
      player2StartSpecialCooldownRatio: 0.55,
      player1HealthMultiplier: 1,
      player2HealthMultiplier: 0.95,
    },
  },
  {
    id: 'archive_lockdown',
    label: 'Archive Lockdown',
    description: 'The archive compresses the duel and arms its enforcer before the record closes.',
    ruleSummary: '84 seconds · fortified enforcer · reduced opening conviction',
    fightRules: {
      id: 'archive_lockdown',
      label: 'Archive Lockdown',
      roundTimeSeconds: 84,
      player1StartEnergyRatio: 0.82,
      player2StartEnergyRatio: 0.86,
      player1StartSpecialCooldownRatio: 0.08,
      player2StartSpecialCooldownRatio: 0.22,
      player1HealthMultiplier: 1,
      player2HealthMultiplier: 1.06,
    },
  },
  {
    id: 'gate_judgment',
    label: 'Gate Judgment',
    description:
      'A shortened final verdict against a fully armed gatekeeper with no ceremonial delay.',
    ruleSummary: '72 seconds · reinforced gatekeeper · immediate enemy special threat',
    fightRules: {
      id: 'gate_judgment',
      label: 'Gate Judgment',
      roundTimeSeconds: 72,
      player1StartEnergyRatio: 0.72,
      player2StartEnergyRatio: 1,
      player1StartSpecialCooldownRatio: 0.12,
      player2StartSpecialCooldownRatio: 0,
      player1HealthMultiplier: 1,
      player2HealthMultiplier: 1.18,
    },
  },
];

function getStageOneCombatMode(index: number): StageOneCombatMode {
  const mode = STAGE_ONE_COMBAT_MODES[index] ?? STAGE_ONE_COMBAT_MODES.at(-1);
  if (!mode) {
    throw new Error('Stage 1 requires at least one combat mode');
  }
  return mode;
}

/**
 * The current combat engine is a focused two-fighter simulation. Stage 1 uses
 * one authored roster representative for each Babylon wave so the complete
 * campaign route can ship without disguising placeholder multi-enemy logic as
 * a finished crowd brawler.
 */
export const STAGE_ONE_ENCOUNTERS: readonly StageOneEncounter[] = STAGE_ONE.waves.map(
  (wave, index) => {
    const representatives: readonly CharacterId[] = ['socrates', 'schmitt', 'machiavelli'];
    const titles = ['The Market Examiner', 'The Archive Enforcer', 'The Ziggurat Gatekeeper'];
    const difficulties: readonly AIDifficulty[] = ['easy', 'medium', 'hard'];
    return {
      index,
      wave: wave.wave,
      enemyCharacterId: representatives[index] ?? 'machiavelli',
      enemyArchetypes: wave.enemies,
      note: wave.note,
      title: titles[index] ?? `Babylon Wave ${wave.wave}`,
      aiDifficulty: difficulties[index] ?? 'hard',
      mode: getStageOneCombatMode(index),
    };
  }
);

export function getStageOneEncounter(index: number): StageOneEncounter {
  return (STAGE_ONE_ENCOUNTERS[index] ?? STAGE_ONE_ENCOUNTERS[0]) as StageOneEncounter;
}

export function isFinalStageOneEncounter(index: number): boolean {
  return index >= STAGE_ONE_ENCOUNTERS.length - 1;
}
