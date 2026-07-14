import { createFightRuntime } from '@/app/fight-runtime';
import { createEmptyPlayerInput } from '@/core/input/input-binding';
import { describe, expect, it } from 'vitest';

describe('Stage Mode opponent AI', () => {
  it('drives player 2 toward the protagonist when enabled', () => {
    const runtime = createFightRuntime();
    runtime.reset({ player1: 'camus', player2: 'socrates' }, { player2AIDifficulty: 'easy' });
    const input = createEmptyPlayerInput();
    const startingX = runtime.getState()?.player2.x;

    for (let frame = 0; frame < 20; frame++) {
      runtime.update(1000 / 60, input, input, true);
    }

    const endingX = runtime.getState()?.player2.x;
    expect(startingX).toBeTypeOf('number');
    expect(endingX).toBeTypeOf('number');
    expect(endingX as number).toBeLessThan(startingX as number);
    expect(runtime.getPlayer2AIDifficulty()).toBe('easy');
  });

  it('switches AI profiles between campaign encounters', () => {
    const runtime = createFightRuntime();
    runtime.reset({ player1: 'camus', player2: 'machiavelli' }, { player2AIDifficulty: 'hard' });

    expect(runtime.getPlayer2AIDifficulty()).toBe('hard');
  });
});
