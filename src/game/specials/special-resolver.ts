import type { CharacterId } from '@/content/characters/character-data';
import { getUnlockedSpecials } from '@/content/skill-tree';
import {
  type SpecialMoveDefinition,
  getSpecialByCommandSlot,
  getSpecialMove,
} from '@/content/specials';
import type { CommandSlot } from '@/game/fight/command-input';

export type SpecialResolveRejectReason = 'no_special' | 'locked' | 'not_enough_energy' | 'cooldown';

export interface SpecialRuntimeState {
  characterId: CharacterId;
  energy: number;
  unlockedNodeIds: readonly string[];
  cooldowns: Readonly<Record<string, number>>;
}

export type SpecialResolveResult =
  | { ok: true; special: SpecialMoveDefinition; next: SpecialRuntimeState }
  | { ok: false; reason: SpecialResolveRejectReason; special?: SpecialMoveDefinition };

export function resolveCommandSpecial(
  state: SpecialRuntimeState,
  commandSlot: CommandSlot
): SpecialResolveResult {
  const special = getSpecialByCommandSlot(state.characterId, commandSlot);
  if (!special) return { ok: false, reason: 'no_special' };

  const unlockedSpecialIds = getUnlockedSpecials(state.characterId, state.unlockedNodeIds);
  if (!unlockedSpecialIds.includes(special.id)) return { ok: false, reason: 'locked', special };
  if (state.energy < special.energyCost) return { ok: false, reason: 'not_enough_energy', special };
  if ((state.cooldowns[special.id] ?? 0) > 0) return { ok: false, reason: 'cooldown', special };

  return {
    ok: true,
    special,
    next: {
      ...state,
      energy: state.energy - special.energyCost,
      cooldowns: { ...state.cooldowns, [special.id]: special.cooldownFrames },
    },
  };
}

export function tickSpecialCooldowns(
  cooldowns: Readonly<Record<string, number>>
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(cooldowns)
      .map(([id, frames]) => [id, Math.max(0, frames - 1)] as const)
      .filter(([, frames]) => frames > 0)
  );
}

export function resolveSpecialById(
  state: SpecialRuntimeState,
  specialMoveId: string
): SpecialResolveResult {
  const special = getSpecialMove(specialMoveId);
  if (!special) return { ok: false, reason: 'no_special' };
  return resolveCommandSpecial(state, special.commandSlot);
}

import type { AttackData, FighterStats } from '@/game/fight/fighter-state';

export interface LegacyResolveSpecialMoveInput {
  characterId: CharacterId;
  commandSlot: CommandSlot;
  stats: FighterStats;
  currentEnergy: number;
  cooldownFrames: number;
}

export type LegacyResolveSpecialMoveResult =
  | { ok: true; move: SpecialMoveDefinition; attack: AttackData }
  | { ok: false; reason: SpecialResolveRejectReason; move?: SpecialMoveDefinition; attack?: never };

export function resolveSpecialMove(
  input: LegacyResolveSpecialMoveInput
): LegacyResolveSpecialMoveResult {
  const move = getSpecialByCommandSlot(input.characterId, input.commandSlot);
  if (!move) return { ok: false, reason: 'no_special' };
  if (input.currentEnergy < move.energyCost)
    return { ok: false, reason: 'not_enough_energy', move };
  if (input.cooldownFrames > 0) return { ok: false, reason: 'cooldown', move };

  return { ok: true, move, attack: specialMoveToAttackData(move, input.stats) };
}

export function specialMoveToAttackData(
  move: SpecialMoveDefinition,
  stats: FighterStats
): AttackData {
  const intelligenceBonus = Math.max(0, Math.round(stats.intelligence * 0.5));
  return {
    id: move.id,
    name: move.displayName,
    damage: 14 + intelligenceBonus + Math.round(move.energyCost * 0.2),
    hitstun: move.tags.includes('launcher') ? 24 : 18,
    knockbackX: move.tags.includes('dash') ? 8 : 5,
    knockbackY: move.tags.includes('launcher') ? 4 : 0,
    range: move.projectile?.kind === 'laser' ? 220 : move.field ? move.field.radius : 120,
    startup: move.startupFrames,
    active: move.activeFrames,
    recovery: move.recoveryFrames,
    type: 'special',
    ...(move.hitPolicyPreset ? { hitPolicyPreset: move.hitPolicyPreset } : {}),
    ...(move.moveClassPreset ? { moveClassPreset: move.moveClassPreset } : {}),
    presentationPreset: 'special_invocation',
    hitbox: {
      offsetX: move.field ? -Math.round((move.field.radius ?? 100) * 0.5) : 30,
      offsetY: -70,
      width: move.projectile?.kind === 'laser' ? 220 : move.field ? move.field.radius : 120,
      height: move.field ? 90 : 42,
    },
  };
}
