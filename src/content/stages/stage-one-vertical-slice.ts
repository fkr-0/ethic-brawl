import type { CharacterId } from '@/content/characters/character-data';
import { STORY_STAGES } from './story-stage-data';

export interface StageOneEncounter {
  index: number;
  wave: number;
  enemyCharacterId: CharacterId;
  enemyArchetypes: readonly string[];
  note: string;
  title: string;
}

export const STAGE_ONE = STORY_STAGES.babylon;

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
    return {
      index,
      wave: wave.wave,
      enemyCharacterId: representatives[index] ?? 'machiavelli',
      enemyArchetypes: wave.enemies,
      note: wave.note,
      title: titles[index] ?? `Babylon Wave ${wave.wave}`,
    };
  }
);

export function getStageOneEncounter(index: number): StageOneEncounter {
  return (STAGE_ONE_ENCOUNTERS[index] ?? STAGE_ONE_ENCOUNTERS[0]) as StageOneEncounter;
}

export function isFinalStageOneEncounter(index: number): boolean {
  return index >= STAGE_ONE_ENCOUNTERS.length - 1;
}

