/**
 * Minimal campaign item system.
 *
 * The first pass is intentionally small: four quick slots, stackable consumables,
 * equippable hand weapons, permanent book stat increases, and temporary boosts.
 */

import type { FighterStats } from '@/game/fight/fighter-state';

export const INVENTORY_SLOT_COUNT = 4 as const;
export const ITEM_SLOT_IDS = [0, 1, 2, 3] as const;

export type ItemSlotId = (typeof ITEM_SLOT_IDS)[number];
export type ItemCategory =
  | 'consumable'
  | 'weapon'
  | 'throwable'
  | 'deployable'
  | 'gadget'
  | 'book'
  | 'temporary_boost';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic';
export type ItemResource = 'health' | 'energy';
export type ItemStat = keyof FighterStats;
export type ItemModifierMode = 'flat' | 'percent';
export type WeaponFamily =
  | 'sword'
  | 'bat'
  | 'mace'
  | 'pipe'
  | 'katana'
  | 'firearm'
  | 'throwable'
  | 'heavy_prop'
  | 'launcher'
  | 'deployable'
  | 'rifle'
  | 'bow'
  | 'chair'
  | 'shovel'
  | 'gadget';

export interface ItemStatModifier {
  stat: ItemStat;
  amount: number;
  mode: ItemModifierMode;
}

export interface RestoreItemEffect {
  type: 'restore';
  resource: ItemResource;
  amount: number;
  amountMode: 'flat' | 'percent';
}

export interface WeaponItemEffect {
  type: 'weapon';
  family: WeaponFamily;
  damageBonus: number;
  speedModifier: number;
  hitstunBonus: number;
}

export interface ThrowableItemEffect {
  type: 'throwable';
  projectileId: string;
  damage: number;
  radius: number;
  throwSpeed: number;
}

export interface DeployableItemEffect {
  type: 'deployable';
  actorId: string;
  durationSeconds: number;
  cooldownSeconds: number;
}

export interface GadgetItemEffect {
  type: 'gadget';
  actions: readonly ('hack' | 'deploy' | 'smash')[];
  damageBonus: number;
  deployableActorId?: string;
  cooldownSeconds?: number;
}

export interface PermanentStatItemEffect {
  type: 'permanent_stat';
  modifiers: readonly ItemStatModifier[];
}

export interface TemporaryBoostItemEffect {
  type: 'temporary_boost';
  durationFights: number;
  modifiers: readonly ItemStatModifier[];
}

export type ItemEffect =
  | RestoreItemEffect
  | WeaponItemEffect
  | ThrowableItemEffect
  | DeployableItemEffect
  | GadgetItemEffect
  | PermanentStatItemEffect
  | TemporaryBoostItemEffect;

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  flavorText: string;
  icon: string;
  stackLimit: number;
  buyValue: number;
  sellValue: number;
  effect: ItemEffect;
  tags: readonly string[];
}

export interface InventoryItemStack {
  itemId: string;
  quantity: number;
}

export type InventorySlots = [
  InventoryItemStack | null,
  InventoryItemStack | null,
  InventoryItemStack | null,
  InventoryItemStack | null,
];

export interface ActiveItemBuff {
  id: string;
  sourceItemId: string;
  name: string;
  remainingFights: number;
  modifiers: readonly ItemStatModifier[];
}

export interface InventoryState {
  slots: InventorySlots;
  selectedWeaponSlot: ItemSlotId | null;
  activeBuffs: ActiveItemBuff[];
}

export interface AddItemResult {
  inventory: InventoryState;
  added: number;
  overflow: number;
}

export interface UseItemResult {
  inventory: InventoryState;
  item: ItemDefinition;
  consumed: boolean;
  effect: ItemEffect;
}

export function createEmptyInventory(): InventoryState {
  return {
    slots: [null, null, null, null],
    selectedWeaponSlot: null,
    activeBuffs: [],
  };
}

export function isItemSlotId(value: number): value is ItemSlotId {
  return ITEM_SLOT_IDS.includes(value as ItemSlotId);
}

export function getInventorySlot(
  inventory: InventoryState,
  slotId: ItemSlotId
): InventoryItemStack | null {
  return inventory.slots[slotId];
}

export function addItem(
  inventory: InventoryState,
  item: ItemDefinition,
  quantity: number
): AddItemResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { inventory, added: 0, overflow: Math.max(0, quantity) };
  }

  let remaining = quantity;
  let next = cloneInventory(inventory);

  for (const slotId of ITEM_SLOT_IDS) {
    const stack = next.slots[slotId];
    if (!stack || stack.itemId !== item.id || stack.quantity >= item.stackLimit) {
      continue;
    }

    const room = item.stackLimit - stack.quantity;
    const moved = Math.min(room, remaining);
    next = setInventorySlot(next, slotId, {
      itemId: item.id,
      quantity: stack.quantity + moved,
    });
    remaining -= moved;

    if (remaining === 0) {
      return { inventory: next, added: quantity, overflow: 0 };
    }
  }

  for (const slotId of ITEM_SLOT_IDS) {
    const stack = next.slots[slotId];
    if (stack) {
      continue;
    }

    const moved = Math.min(item.stackLimit, remaining);
    next = setInventorySlot(next, slotId, {
      itemId: item.id,
      quantity: moved,
    });
    remaining -= moved;

    if (remaining === 0) {
      return { inventory: next, added: quantity, overflow: 0 };
    }
  }

  return {
    inventory: next,
    added: quantity - remaining,
    overflow: remaining,
  };
}

export function removeItemFromSlot(
  inventory: InventoryState,
  slotId: ItemSlotId,
  quantity = 1
): InventoryState {
  const stack = inventory.slots[slotId];
  if (!stack || !Number.isInteger(quantity) || quantity <= 0) {
    return inventory;
  }

  const nextQuantity = stack.quantity - quantity;
  const nextStack = nextQuantity > 0 ? { ...stack, quantity: nextQuantity } : null;
  const nextInventory = setInventorySlot(inventory, slotId, nextStack);

  if (nextInventory.selectedWeaponSlot === slotId && nextStack === null) {
    return { ...nextInventory, selectedWeaponSlot: null };
  }

  return nextInventory;
}

export function moveItemSlot(
  inventory: InventoryState,
  fromSlotId: ItemSlotId,
  toSlotId: ItemSlotId
): InventoryState {
  if (fromSlotId === toSlotId) {
    return inventory;
  }

  const nextSlots = copySlots(inventory.slots);
  const fromStack = nextSlots[fromSlotId];
  nextSlots[fromSlotId] = nextSlots[toSlotId];
  nextSlots[toSlotId] = fromStack;

  return {
    ...inventory,
    slots: nextSlots,
    selectedWeaponSlot: moveSelectedWeaponSlot(inventory.selectedWeaponSlot, fromSlotId, toSlotId),
  };
}

export function selectWeaponSlot(
  inventory: InventoryState,
  slotId: ItemSlotId,
  item: ItemDefinition
): InventoryState {
  const stack = inventory.slots[slotId];
  if (!stack || stack.itemId !== item.id || item.category !== 'weapon') {
    return inventory;
  }

  return { ...inventory, selectedWeaponSlot: slotId };
}

export function clearSelectedWeaponSlot(inventory: InventoryState): InventoryState {
  return { ...inventory, selectedWeaponSlot: null };
}

export function useItemFromSlot(
  inventory: InventoryState,
  slotId: ItemSlotId,
  item: ItemDefinition
): UseItemResult | null {
  const stack = inventory.slots[slotId];
  if (!stack || stack.itemId !== item.id) {
    return null;
  }

  if (item.category === 'weapon') {
    return {
      inventory: selectWeaponSlot(inventory, slotId, item),
      item,
      consumed: false,
      effect: item.effect,
    };
  }

  let nextInventory = removeItemFromSlot(inventory, slotId, 1);
  if (item.effect.type === 'temporary_boost') {
    nextInventory = activateTemporaryBoost(nextInventory, item);
  }

  return {
    inventory: nextInventory,
    item,
    consumed: true,
    effect: item.effect,
  };
}

export function activateTemporaryBoost(
  inventory: InventoryState,
  item: ItemDefinition
): InventoryState {
  if (item.effect.type !== 'temporary_boost') {
    return inventory;
  }

  const buff: ActiveItemBuff = {
    id: `${item.id}_${Date.now()}`,
    sourceItemId: item.id,
    name: item.name,
    remainingFights: item.effect.durationFights,
    modifiers: item.effect.modifiers,
  };

  return {
    ...inventory,
    activeBuffs: [...inventory.activeBuffs, buff],
  };
}

export function tickItemBuffsAfterFight(inventory: InventoryState): InventoryState {
  return {
    ...inventory,
    activeBuffs: inventory.activeBuffs
      .map((buff) => ({
        ...buff,
        remainingFights: buff.remainingFights - 1,
      }))
      .filter((buff) => buff.remainingFights > 0),
  };
}

export function applyStatModifiers(
  stats: FighterStats,
  modifiers: readonly ItemStatModifier[]
): FighterStats {
  const nextStats: FighterStats = { ...stats };

  for (const modifier of modifiers) {
    const current = nextStats[modifier.stat];
    const delta =
      modifier.mode === 'percent' ? Math.round((current * modifier.amount) / 100) : modifier.amount;
    const nextValue = Math.max(0, current + delta);

    if (modifier.stat === 'health') {
      nextStats.health = Math.min(nextStats.maxHealth, nextValue);
    } else if (modifier.stat === 'maxHealth') {
      nextStats.maxHealth = nextValue;
      nextStats.health = Math.min(nextStats.health, nextValue);
    } else {
      nextStats[modifier.stat] = nextValue;
    }
  }

  return nextStats;
}

export function applyPermanentItemEffect(stats: FighterStats, item: ItemDefinition): FighterStats {
  if (item.effect.type !== 'permanent_stat') {
    return stats;
  }

  return applyStatModifiers(stats, item.effect.modifiers);
}

export function applyRestoreEffect(
  stats: FighterStats,
  item: ItemDefinition
): { stats: FighterStats; restoredEnergy: number } {
  if (item.effect.type !== 'restore') {
    return { stats, restoredEnergy: 0 };
  }

  if (item.effect.resource === 'energy') {
    return { stats, restoredEnergy: item.effect.amount };
  }

  const restoredHealth =
    item.effect.amountMode === 'percent'
      ? Math.round((stats.maxHealth * item.effect.amount) / 100)
      : item.effect.amount;

  return {
    stats: {
      ...stats,
      health: Math.min(stats.maxHealth, stats.health + restoredHealth),
    },
    restoredEnergy: 0,
  };
}

function cloneInventory(inventory: InventoryState): InventoryState {
  return {
    ...inventory,
    slots: copySlots(inventory.slots),
    activeBuffs: inventory.activeBuffs.map((buff) => ({ ...buff })),
  };
}

function copySlots(slots: InventorySlots): InventorySlots {
  return [...slots] as InventorySlots;
}

function setInventorySlot(
  inventory: InventoryState,
  slotId: ItemSlotId,
  stack: InventoryItemStack | null
): InventoryState {
  const slots = copySlots(inventory.slots);
  slots[slotId] = stack;
  return { ...inventory, slots };
}

function moveSelectedWeaponSlot(
  selectedWeaponSlot: ItemSlotId | null,
  fromSlotId: ItemSlotId,
  toSlotId: ItemSlotId
): ItemSlotId | null {
  if (selectedWeaponSlot === fromSlotId) {
    return toSlotId;
  }

  if (selectedWeaponSlot === toSlotId) {
    return fromSlotId;
  }

  return selectedWeaponSlot;
}
