import { createFightRuntime } from '@/app/fight-runtime';
import { createEmptyPlayerInput } from '@/core/input/input-binding';
import { describe, expect, it } from 'vitest';

describe('fight runtime', () => {
  it('creates a live fight state and advances simulation from player input', () => {
    const runtime = createFightRuntime();
    const initialState = runtime.getState();

    expect(initialState).not.toBeNull();
    if (!initialState) {
      throw new Error('expected fight state');
    }

    const startX = initialState.player1.x;

    runtime.update(
      16.667,
      { ...createEmptyPlayerInput(), moveRight: true },
      createEmptyPlayerInput()
    );
    const nextState = runtime.getState();

    expect(nextState?.frameCount).toBe(1);
    expect(nextState?.player1.x).toBeGreaterThan(startX);
  });

  it('resets back to a fresh round state', () => {
    const runtime = createFightRuntime();
    runtime.update(
      16.667,
      { ...createEmptyPlayerInput(), moveRight: true },
      createEmptyPlayerInput()
    );

    runtime.reset();
    const resetState = runtime.getState();

    expect(resetState?.frameCount).toBe(0);
    expect(resetState?.round.number).toBe(1);
    expect(resetState?.player1.health).toBe(resetState?.player1.stats.maxHealth);
  });
});
