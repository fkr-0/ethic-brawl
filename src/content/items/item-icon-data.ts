import type { ItemId } from './item-data';

export const ITEM_ICON_IDS = [
  'life_potion_small',
  'life_potion_large',
  'energy_potion_small',
  'energy_potion_large',
  'rusted_short_sword',
  'neon_duelist_sword',
  'street_argument_bat',
  'civic_mace',
  'riot_breaker_mace',
  'pipe',
  'uzi',
  'bat',
  'katana',
  'molotov_cocktail',
  'grenade',
  'boulder',
  'rocket_launcher',
  'minidrone',
  'computer_terminal',
  'sniper_rifle',
  'bow',
  'foldable_chair',
  'shovel',
  'book_stoic_body',
  'book_dialectic_reflexes',
  'book_machine_ethics',
  'book_arcology_rhetoric',
  'temp_boost_adrenaline_patch',
  'temp_boost_focus_lens',
  'temp_boost_armor_gel',
  'temp_boost_overclock_scroll',
] as const satisfies readonly ItemId[];

export interface ItemIconDefinition {
  itemId: ItemId;
  atlasPath: string;
  atlasIndex: number;
  row: number;
  column: number;
}

export const ITEM_ICON_DEFINITIONS: Record<ItemId, ItemIconDefinition> = Object.fromEntries(
  ITEM_ICON_IDS.map((itemId, index) => {
    const indexInSheet = index % 16;
    return [
      itemId,
      {
        itemId,
        atlasPath: `assets/sprites/items/icons-${Math.floor(index / 16) + 1}.png`,
        atlasIndex: indexInSheet,
        row: Math.floor(indexInSheet / 4),
        column: indexInSheet % 4,
      },
    ];
  })
) as Record<ItemId, ItemIconDefinition>;

export function getItemIcon(itemId: string): ItemIconDefinition | null {
  return ITEM_ICON_DEFINITIONS[itemId as ItemId] ?? null;
}
