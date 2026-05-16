import { getItem, getItemsByCategory } from '@/content/items';
import type { FighterStats } from '@/game/fight/fighter-state';
import {
  addItem,
  applyPermanentItemEffect,
  applyRestoreEffect,
  applyStatModifiers,
  createEmptyInventory,
  tickItemBuffsAfterFight,
  useItemFromSlot,
} from '@/game/items';
import { describe, expect, it } from 'vitest';

describe('item system', () => {
  it('creates a four-slot inventory', () => {
    const inventory = createEmptyInventory();

    expect(inventory.slots).toHaveLength(4);
    expect(inventory.slots.every((slot) => slot === null)).toBe(true);
  });

  it('stacks consumables up to stack limit and reports overflow', () => {
    const potion = getItem('life_potion_small');
    const result = addItem(createEmptyInventory(), potion, 5);

    expect(result.added).toBe(5);
    expect(result.overflow).toBe(0);
    expect(result.inventory.slots[0]).toEqual({ itemId: potion.id, quantity: 3 });
    expect(result.inventory.slots[1]).toEqual({ itemId: potion.id, quantity: 2 });
  });

  it('selects weapons without consuming them', () => {
    const sword = getItem('rusted_short_sword');
    const { inventory } = addItem(createEmptyInventory(), sword, 1);
    const result = useItemFromSlot(inventory, 0, sword);

    expect(result?.consumed).toBe(false);
    expect(result?.inventory.selectedWeaponSlot).toBe(0);
    expect(result?.inventory.slots[0]).toEqual({ itemId: sword.id, quantity: 1 });
  });

  it('consumes temporary boosts and ticks their fight duration', () => {
    const boost = getItem('temp_boost_adrenaline_patch');
    const { inventory } = addItem(createEmptyInventory(), boost, 1);
    const used = useItemFromSlot(inventory, 0, boost);

    expect(used?.consumed).toBe(true);
    if (!used) {
      throw new Error('Expected item use result');
    }
    expect(used.inventory.slots[0]).toBeNull();
    expect(used.inventory.activeBuffs).toHaveLength(1);

    const afterFight = tickItemBuffsAfterFight(used.inventory);
    expect(afterFight.activeBuffs).toHaveLength(0);
  });

  it('applies permanent book stat modifiers', () => {
    const stats: FighterStats = {
      health: 90,
      maxHealth: 100,
      strength: 10,
      defense: 8,
      agility: 7,
      intelligence: 6,
      vitality: 10,
      energy: 50,
    };
    const result = applyPermanentItemEffect(stats, getItem('book_arcology_rhetoric'));

    expect(result.strength).toBe(12);
    expect(result.defense).toBe(9);
  });

  it('applies restores and percent modifiers safely', () => {
    const stats: FighterStats = {
      health: 80,
      maxHealth: 100,
      strength: 10,
      defense: 8,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      energy: 50,
    };

    const healed = applyRestoreEffect(stats, getItem('life_potion_large'));
    expect(healed.stats.health).toBe(100);

    const boosted = applyStatModifiers(stats, [{ stat: 'agility', amount: 15, mode: 'percent' }]);
    expect(boosted.agility).toBe(12);
  });

  it('exposes basic requested item classes', () => {
    expect(getItemsByCategory('consumable').map((item) => item.id)).toEqual(
      expect.arrayContaining([
        'life_potion_small',
        'life_potion_large',
        'energy_potion_small',
        'energy_potion_large',
      ])
    );
    expect(getItemsByCategory('weapon').map((item) => item.id)).toEqual(
      expect.arrayContaining(['rusted_short_sword', 'civic_mace'])
    );
    expect(getItemsByCategory('book')).toHaveLength(4);
    expect(getItemsByCategory('temporary_boost')).toHaveLength(4);
  });
});
