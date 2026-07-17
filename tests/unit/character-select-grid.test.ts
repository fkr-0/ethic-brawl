import {
  CHARACTER_SELECT_COLUMNS,
  createInitialAppShellState,
  moveCharacterSelectGridIndex,
} from '@/app/app-shell/scene-factory';
import { RELEASE_ROSTER_IDS } from '@/content/characters/release-roster';
import { describe, expect, it } from 'vitest';

describe('character select grid navigation', () => {
  it('boots against the curated release roster', () => {
    const state = createInitialAppShellState();
    expect(RELEASE_ROSTER_IDS).toHaveLength(13);
    expect(state.pendingSelection).toEqual({ player1: 'camus', player2: 'machiavelli' });
  });

  it('moves vertically by one roster row', () => {
    expect(CHARACTER_SELECT_COLUMNS).toBe(6);
    expect(moveCharacterSelectGridIndex(2, 'down', 18)).toBe(8);
    expect(moveCharacterSelectGridIndex(8, 'up', 18)).toBe(2);
  });

  it('wraps between the first and last roster rows', () => {
    expect(moveCharacterSelectGridIndex(1, 'up', 18)).toBe(13);
    expect(moveCharacterSelectGridIndex(16, 'down', 18)).toBe(4);
  });
});
