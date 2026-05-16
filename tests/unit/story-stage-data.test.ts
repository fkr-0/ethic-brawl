import { ITEM_CATALOG } from '@/content/items';
import { STORY_STAGE_ORDER, getStoryStage, getStoryStageList } from '@/content/stages';
import { describe, expect, it } from 'vitest';

describe('story stage data', () => {
  it('defines the requested six-stage story path in order', () => {
    expect(STORY_STAGE_ORDER).toEqual([
      'babylon',
      'babylon_postapocalypse',
      'sprawl',
      'arcology_entrance',
      'arcology_labs',
      'arcology_penthouse',
    ]);
    expect(getStoryStageList().map((stage) => stage.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('links stages forward and ends at the penthouse', () => {
    expect(getStoryStage('babylon').unlocksAfterClear).toEqual(['babylon_postapocalypse']);
    expect(getStoryStage('arcology_penthouse').unlocksAfterClear).toEqual([]);
  });

  it('gives every stage hazards, waves, enemies, and valid item rewards', () => {
    for (const stage of getStoryStageList()) {
      expect(stage.hazards.length).toBeGreaterThan(0);
      expect(stage.waves).toHaveLength(3);

      for (const wave of stage.waves) {
        expect(wave.enemies.length).toBeGreaterThan(0);
        expect(wave.note.length).toBeGreaterThan(0);
      }

      for (const itemId of stage.rewardItemIds) {
        expect(ITEM_CATALOG[itemId as keyof typeof ITEM_CATALOG]).toBeDefined();
      }
    }
  });
});
