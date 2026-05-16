import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import type { SpecialTag } from '@/content/specials';
import { getSpecialsForCharacter } from '@/content/specials';
import type { CommandSlot } from '@/game/fight/command-input';

export interface SkillMutator {
  id: string;
  description: string;
  energyCostDelta?: number;
  cooldownMultiplier?: number;
  addTags?: readonly SpecialTag[];
}

export interface SkillNode {
  id: string;
  characterId: CharacterId;
  commandSlot: CommandSlot;
  specialMoveId: string;
  displayName: string;
  tier: 1 | 2 | 3 | 4;
  energyCost: number;
  cooldownFrames: number;
  prerequisites: readonly string[];
  tags: readonly SpecialTag[];
  projectileId?: string;
  fieldId?: string;
  vfxPresetId: string;
  animationClipId: string;
  masteryMutators?: readonly SkillMutator[];
}

export const SKILL_TREE_NODES: Record<string, SkillNode> = Object.fromEntries(
  getCharacterIds().flatMap((characterId) =>
    getSpecialsForCharacter(characterId).map((special, index) => {
      const node: SkillNode = {
        id: `${special.id}_node`,
        characterId,
        commandSlot: special.commandSlot,
        specialMoveId: special.id,
        displayName: special.displayName,
        tier: (index === 0 ? 1 : index === 1 ? 2 : index === 2 ? 3 : 4) as 1 | 2 | 3 | 4,
        energyCost: special.energyCost,
        cooldownFrames: special.cooldownFrames,
        prerequisites:
          index === 0 ? [] : [`${getSpecialsForCharacter(characterId)[index - 1]?.id}_node`],
        tags: special.tags,
        ...(special.projectile ? { projectileId: special.projectile.id } : {}),
        ...(special.field ? { fieldId: special.field.id } : {}),
        vfxPresetId: special.animation.vfxClipId ?? 'impact_spark_base',
        animationClipId: special.animation.casterClipId,
        masteryMutators: [
          {
            id: `${special.id}_mastery`,
            description: `Master ${special.displayName}: -10% cooldown, +command consistency.`,
            cooldownMultiplier: 0.9,
          },
        ],
      };
      return [node.id, node];
    })
  )
);

export function getSkillNodesForCharacter(characterId: CharacterId): SkillNode[] {
  return Object.values(SKILL_TREE_NODES).filter((node) => node.characterId === characterId);
}

export function getUnlockedSpecials(
  characterId: CharacterId,
  unlockedNodeIds: readonly string[]
): string[] {
  const unlocked = new Set(unlockedNodeIds);
  return getSkillNodesForCharacter(characterId)
    .filter((node) => unlocked.has(node.id))
    .map((node) => node.specialMoveId);
}

export function canUnlockSkillNode(node: SkillNode, unlockedNodeIds: readonly string[]): boolean {
  const unlocked = new Set(unlockedNodeIds);
  return (
    !unlocked.has(node.id) && node.prerequisites.every((prerequisite) => unlocked.has(prerequisite))
  );
}
