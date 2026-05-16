import type { CharacterId } from '@/content/characters/character-data';
import { getSkillNodesForCharacter } from '@/content/skill-tree';

export const ENERGY_PER_STAT_POINT = 5;

export interface FighterSpecialState {
  currentEnergy: number;
  maxEnergy: number;
  unlockedNodeIds: string[];
  cooldowns: Record<string, number>;
}

export function createDefaultSpecialState(
  characterId: CharacterId,
  energyStat: number
): FighterSpecialState {
  const maxEnergy = energyStatToMaxEnergy(energyStat);
  return {
    currentEnergy: maxEnergy,
    maxEnergy,
    unlockedNodeIds: getSkillNodesForCharacter(characterId).map((node) => node.id),
    cooldowns: {},
  };
}

export function energyStatToMaxEnergy(energyStat: number): number {
  return Math.max(0, Math.round(energyStat * ENERGY_PER_STAT_POINT));
}

export function spendSpecialEnergy(
  state: FighterSpecialState,
  amount: number
): FighterSpecialState {
  return { ...state, currentEnergy: Math.max(0, state.currentEnergy - amount) };
}

export function restoreSpecialEnergy(
  state: FighterSpecialState,
  amount: number
): FighterSpecialState {
  return { ...state, currentEnergy: Math.min(state.maxEnergy, state.currentEnergy + amount) };
}

export function tickFighterSpecialState(state: FighterSpecialState): FighterSpecialState {
  return {
    ...state,
    cooldowns: Object.fromEntries(
      Object.entries(state.cooldowns)
        .map(([id, frames]) => [id, Math.max(0, frames - 1)] as const)
        .filter(([, frames]) => frames > 0)
    ),
  };
}
