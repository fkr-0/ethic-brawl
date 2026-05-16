import {
  canUnlockSkillNode,
  getSkillNodesForCharacter,
  getUnlockedSpecials,
} from '@/content/skill-tree';
import { getSpecialsForCharacter } from '@/content/specials';
import { resolveCommandSpecial, tickSpecialCooldowns } from '@/game/specials';
import { describe, expect, it } from 'vitest';

function requireNode(characterId: Parameters<typeof getSkillNodesForCharacter>[0], index: number) {
  const node = getSkillNodesForCharacter(characterId)[index];
  expect(node).toBeDefined();
  if (!node) {
    throw new Error(`Missing skill node ${characterId}[${index}]`);
  }
  return node;
}

function requireUnlockedSpecial(
  characterId: Parameters<typeof getUnlockedSpecials>[0],
  nodeIds: string[]
) {
  const specialId = getUnlockedSpecials(characterId, nodeIds)[0];
  expect(specialId).toBeDefined();
  if (!specialId) {
    throw new Error(`Missing unlocked special for ${characterId}`);
  }
  return specialId;
}

describe('special skill tree and resolver', () => {
  it('provides four MVP specials per current playable character', () => {
    for (const characterId of ['camus', 'diogenes', 'leibniz', 'machiavelli'] as const) {
      expect(getSpecialsForCharacter(characterId)).toHaveLength(4);
      expect(getSkillNodesForCharacter(characterId)).toHaveLength(4);
    }
  });

  it('supports prerequisite-gated unlocks', () => {
    const first = requireNode('camus', 0);
    const second = requireNode('camus', 1);
    expect(canUnlockSkillNode(first, [])).toBe(true);
    expect(canUnlockSkillNode(second, [])).toBe(false);
    expect(canUnlockSkillNode(second, [first.id])).toBe(true);
  });

  it('rejects locked specials and accepts unlocked specials with energy/cooldown costs', () => {
    const firstNode = requireNode('camus', 0);
    const locked = resolveCommandSpecial(
      { characterId: 'camus', energy: 99, unlockedNodeIds: [], cooldowns: {} },
      'BFA'
    );
    const accepted = resolveCommandSpecial(
      { characterId: 'camus', energy: 99, unlockedNodeIds: [firstNode.id], cooldowns: {} },
      'BFA'
    );

    expect(locked.ok).toBe(false);
    expect(locked.ok ? null : locked.reason).toBe('locked');
    expect(accepted.ok).toBe(true);
    if (accepted.ok) {
      expect(accepted.next.energy).toBe(81);
      expect(accepted.next.cooldowns[accepted.special.id]).toBe(accepted.special.cooldownFrames);
    }
  });

  it('rejects energy and cooldown gates', () => {
    const firstNode = requireNode('camus', 0);
    const specialId = requireUnlockedSpecial('camus', [firstNode.id]);

    expect(
      resolveCommandSpecial(
        { characterId: 'camus', energy: 0, unlockedNodeIds: [firstNode.id], cooldowns: {} },
        'BFA'
      )
    ).toMatchObject({ ok: false, reason: 'not_enough_energy' });
    expect(
      resolveCommandSpecial(
        {
          characterId: 'camus',
          energy: 99,
          unlockedNodeIds: [firstNode.id],
          cooldowns: { [specialId]: 2 },
        },
        'BFA'
      )
    ).toMatchObject({ ok: false, reason: 'cooldown' });
    expect(tickSpecialCooldowns({ [specialId]: 2 })).toEqual({ [specialId]: 1 });
    expect(tickSpecialCooldowns({ [specialId]: 1 })).toEqual({});
  });
});
