import { createIndexedGridFocus } from '@/runtime/grid-focus';
import { describe, expect, it, vi } from 'vitest';

const items = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: `item-${index}` }));

describe('Runtime indexed grid-focus adapter', () => {
  it('preserves preferred columns across ragged rows', () => {
    const focus = createIndexedGridFocus({
      items: items(8),
      columns: 3,
      initialIndex: 2,
      wrapY: true,
    });

    expect(focus.index()).toBe(2);
    expect(focus.move('down')).toBe(5);
    expect(focus.move('down')).toBe(7);
    expect(focus.move('up')).toBe(5);
  });

  it('skips disabled and hidden entries under Runtime navigation', () => {
    const focus = createIndexedGridFocus({
      items: [{ id: 'a' }, { id: 'b', disabled: true }, { id: 'c', hidden: true }, { id: 'd' }],
      columns: 4,
      wrapX: true,
      horizontalMode: 'sequence',
    });

    expect(focus.index()).toBe(0);
    expect(focus.move('right')).toBe(3);
    expect(focus.move('right')).toBe(0);
  });

  it('replaces unavailable focus and emits the Runtime focus-change event', () => {
    const focus = createIndexedGridFocus({ items: items(3), columns: 1, initialIndex: 1 });
    const changed = vi.fn();
    focus.events.on('focus:change', changed);

    const nextIndex = focus.replaceItems([
      { id: 'item-0' },
      { id: 'item-1', hidden: true },
      { id: 'item-2' },
    ]);

    expect(nextIndex).toBe(0);
    expect(focus.current()?.id).toBe('item-0');
    expect(changed).toHaveBeenCalledWith(
      expect.objectContaining({ previousId: 'item-1', id: 'item-0', reason: 'items-updated' })
    );
  });

  it('allows external integer state to resynchronize by index', () => {
    const focus = createIndexedGridFocus({ items: items(4), columns: 2 });

    expect(focus.syncIndex(3)).toBe(3);
    expect(focus.snapshot()).toMatchObject({ focusedId: 'item-3', focusedIndex: 3, columns: 2 });
    expect(focus.syncIndex(99)).toBe(3);
  });
});
