import type { ItemDefinition, ItemEffect } from './item-system';

export type ItemActionKind = 'pickup' | 'equip' | 'consume' | 'throw' | 'use';

export interface WorldItemState {
  id: string;
  itemId: string;
  x: number;
  y: number;
  lane: number;
  quantity: number;
  velocityX: number;
  velocityY: number;
  pickedUpBy?: string;
}

export interface ItemActionRequest {
  kind: ItemActionKind;
  actorId: string;
  item: ItemDefinition;
  worldItem?: WorldItemState;
  facing?: 'left' | 'right';
}

export interface ItemActionResolution {
  kind: ItemActionKind;
  consumedInventoryItem: boolean;
  removesWorldItem: boolean;
  equipsWeapon: boolean;
  effect: ItemEffect | null;
  thrownItem?: WorldItemState;
}

export function resolveItemAction(request: ItemActionRequest): ItemActionResolution {
  switch (request.kind) {
    case 'pickup':
      return {
        kind: 'pickup',
        consumedInventoryItem: false,
        removesWorldItem: true,
        equipsWeapon: false,
        effect: null,
      };
    case 'equip':
      return {
        kind: 'equip',
        consumedInventoryItem: false,
        removesWorldItem: false,
        equipsWeapon: request.item.category === 'weapon',
        effect: request.item.effect,
      };
    case 'consume':
      return {
        kind: 'consume',
        consumedInventoryItem: request.item.category !== 'weapon',
        removesWorldItem: false,
        equipsWeapon: false,
        effect: request.item.effect,
      };
    case 'use':
      return {
        kind: 'use',
        consumedInventoryItem: request.item.category !== 'weapon',
        removesWorldItem: false,
        equipsWeapon: request.item.category === 'weapon',
        effect: request.item.effect,
      };
    case 'throw': {
      const direction = request.facing === 'left' ? -1 : 1;
      return {
        kind: 'throw',
        consumedInventoryItem: true,
        removesWorldItem: false,
        equipsWeapon: false,
        effect: request.item.effect,
        thrownItem: {
          id: `${request.actorId}_${request.item.id}_throw`,
          itemId: request.item.id,
          x: request.worldItem?.x ?? 0,
          y: request.worldItem?.y ?? 0,
          lane: request.worldItem?.lane ?? 1,
          quantity: 1,
          velocityX: direction * 9,
          velocityY: -5,
        },
      };
    }
  }
}

export function updateThrownItem(item: WorldItemState, gravity = 0.6): WorldItemState {
  return {
    ...item,
    x: item.x + item.velocityX,
    y: item.y + item.velocityY,
    velocityY: item.velocityY + gravity,
  };
}
