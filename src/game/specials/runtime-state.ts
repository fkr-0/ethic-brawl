import type { CharacterId } from '@/content/characters/character-data';
import { getSkillNodesForCharacter } from '@/content/skill-tree';
import { createResourcePoolState, gainResource, getResourcePool } from '@arcade/runtime/gameplay';
import { stepRuntimeAction } from '@/runtime/gameplay-actions';

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
  const resources = createResourcePoolState(characterId, [
    { id: 'energy', value: maxEnergy, max: maxEnergy },
  ]);
  return {
    currentEnergy: getResourcePool(resources, 'energy')?.value ?? maxEnergy,
    maxEnergy: getResourcePool(resources, 'energy')?.max ?? maxEnergy,
    unlockedNodeIds: getSkillNodesForCharacter(characterId).map((node) => node.id),
    cooldowns: {},
  };
}

export function energyStatToMaxEnergy(energyStat: number): number {
  return Math.max(0, Math.round(energyStat * ENERGY_PER_STAT_POINT));
}

export function restoreSpecialEnergy(
  state: FighterSpecialState,
  amount: number
): FighterSpecialState {
  const resources = createResourcePoolState('fighter-special', [
    { id: 'energy', value: state.currentEnergy, max: state.maxEnergy },
  ]);
  const restored = gainResource(resources, 'energy', amount, { reason: 'restore' });
  return {
    ...state,
    currentEnergy: getResourcePool(restored.state, 'energy')?.value ?? state.currentEnergy,
  };
}

export function tickFighterSpecialState(state: FighterSpecialState): FighterSpecialState {
  const stepped = stepRuntimeAction(
    {
      ownerId: 'fighter-special',
      resourceId: 'energy',
      resourceValue: state.currentEnergy,
      resourceMax: state.maxEnergy,
      cooldowns: state.cooldowns,
    },
    1
  );
  return {
    ...state,
    currentEnergy: stepped.resourceValue,
    cooldowns: { ...stepped.cooldowns },
  };
}
