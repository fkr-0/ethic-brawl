import { getCharacter, getCharacterNormalChain } from '@/content/characters/character-data';
import { RELEASE_ROSTER_IDS } from '@/content/characters/release-roster';
import { ENEMY_VISUALS, getEnemyAtlasFrameIndex } from '@/content/enemies/enemy-visual-data';
import { ITEM_CATALOG } from '@/content/items/item-data';
import { ITEM_ICON_DEFINITIONS } from '@/content/items/item-icon-data';
import { getSpecialsForCharacter } from '@/content/specials/special-data';
import { getStoryStageList } from '@/content/stages/story-stage-data';
import { describe, expect, it } from 'vitest';

describe('v1.1 release content contract', () => {
  it('ships the curated thirteen-fighter roster with complete authored kits', () => {
    expect(RELEASE_ROSTER_IDS).toHaveLength(13);
    expect(new Set(RELEASE_ROSTER_IDS).size).toBe(RELEASE_ROSTER_IDS.length);

    for (const characterId of RELEASE_ROSTER_IDS) {
      const character = getCharacter(characterId);
      const chain = getCharacterNormalChain(character);
      const specials = getSpecialsForCharacter(characterId);

      expect(chain, `${characterId} normal chain`).toHaveLength(3);
      expect(new Set(chain.map(({ id }) => id)).size, `${characterId} normal attack ids`).toBe(3);
      expect(specials, `${characterId} command kit`).toHaveLength(4);
      expect(
        new Set(specials.map(({ commandSlot }) => commandSlot)).size,
        `${characterId} command slots`
      ).toBe(4);
      expect(specials.every(({ animation }) => animation.casterClipId.length > 0)).toBe(true);
    }
  });

  it('maps every story enemy to a four-frame production atlas row', () => {
    const stageEnemyIds = new Set(
      getStoryStageList().flatMap((stage) => stage.waves.flatMap((wave) => wave.enemies))
    );

    expect(stageEnemyIds.size).toBe(Object.keys(ENEMY_VISUALS).length);
    for (const enemyId of stageEnemyIds) {
      const visual = ENEMY_VISUALS[enemyId];
      expect(visual.atlasPath).toMatch(/^assets\/sprites\/enemies\/.+\.png$/);
      expect(visual.frameRoles).toEqual(['idle', 'advance', 'attack', 'hurt']);
      expect(getEnemyAtlasFrameIndex(enemyId, 'hurt')).toBe(visual.atlasRow * 4 + 3);
    }
  });

  it('gives every catalogue item a stable atlas icon slot', () => {
    expect(Object.keys(ITEM_ICON_DEFINITIONS)).toEqual(Object.keys(ITEM_CATALOG));
    expect(new Set(Object.values(ITEM_ICON_DEFINITIONS).map(({ atlasIndex }) => atlasIndex)).size).toBe(
      16
    );

    for (const [itemId, icon] of Object.entries(ITEM_ICON_DEFINITIONS)) {
      expect(icon.itemId).toBe(itemId);
      expect(icon.atlasPath).toMatch(/^assets\/sprites\/items\/icons-[12]\.png$/);
      expect(icon.row).toBeGreaterThanOrEqual(0);
      expect(icon.row).toBeLessThan(4);
      expect(icon.column).toBeGreaterThanOrEqual(0);
      expect(icon.column).toBeLessThan(4);
    }
  });
});
