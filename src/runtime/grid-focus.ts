import { createGridFocusNavigator, type ArcadeGridFocusItem } from '@arcade/runtime/ui';

type RuntimeGridNavigator = ReturnType<typeof createGridFocusNavigator>;
export type RuntimeGridDirection = Parameters<RuntimeGridNavigator['move']>[0];

export interface IndexedGridFocusOptions {
  items: readonly ArcadeGridFocusItem[];
  columns?: number;
  initialIndex?: number;
  wrap?: boolean;
  wrapX?: boolean;
  wrapY?: boolean;
  horizontalMode?: 'row' | 'sequence';
}

/**
 * Transitional adapter from Ethic Brawl's serialized integer focus indices to
 * Runtime 1.12's stateful grid navigator. The Runtime owns preferred-column,
 * disabled/hidden skipping and focus replacement; callers can keep mirroring
 * `index()` into existing app/E2E state until that legacy state is removed.
 */
export function createIndexedGridFocus(options: IndexedGridFocusOptions) {
  const initialIndex = Math.max(0, Math.floor(options.initialIndex ?? 0));
  const initialId = options.items[initialIndex]?.id;
  const navigator = createGridFocusNavigator({
    items: options.items,
    columns: options.columns ?? 1,
    ...(initialId === undefined ? {} : { initialId }),
    ...(options.wrap === undefined ? {} : { wrap: options.wrap }),
    ...(options.wrapX === undefined ? {} : { wrapX: options.wrapX }),
    ...(options.wrapY === undefined ? {} : { wrapY: options.wrapY }),
    ...(options.horizontalMode === undefined ? {} : { horizontalMode: options.horizontalMode }),
  });

  return Object.freeze({
    events: navigator.events,
    current: navigator.current,
    index: navigator.index,
    snapshot: navigator.snapshot,
    activate: navigator.activate,
    syncIndex(index: number, reason = 'legacy-index-sync'): number {
      navigator.focusIndex(index, reason);
      return navigator.index();
    },
    move(direction: RuntimeGridDirection): number {
      navigator.move(direction);
      return navigator.index();
    },
    moveBy(direction: RuntimeGridDirection, amount = 1): number {
      navigator.moveBy(direction, amount);
      return navigator.index();
    },
    replaceItems(items: readonly ArcadeGridFocusItem[], columns = options.columns ?? 1): number {
      navigator.setItems(items, columns);
      return navigator.index();
    },
    navigator,
  });
}

export type IndexedGridFocus = ReturnType<typeof createIndexedGridFocus>;
