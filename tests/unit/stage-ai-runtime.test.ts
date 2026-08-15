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

  it('leaves a reliable punish opening against the easy Stage 1 opponent', () => {
    const runtime = createFightRuntime();
    runtime.reset({ player1: 'camus', player2: 'socrates' }, { player2AIDifficulty: 'easy' });
    const startingHealth = runtime.getState()?.player2.health;
    expect(startingHealth).toBeTypeOf('number');

    for (let frame = 0; frame < 360; frame++) {
      const state = runtime.getState();
      if (!state) throw new Error('Missing fight state');
      if (state.player2.health < (startingHealth as number)) break;

      const input = createEmptyPlayerInput();
      const distance = state.player2.x - state.player1.x;
      if (Math.abs(distance) > 58) {
        input.moveRight = distance > 0;
        input.moveLeft = distance < 0;
      } else if (state.player1.currentAttack === null && state.player1.hitstunFrames === 0) {
        input.attack = true;
        input.attackPressed = true;
      }
      runtime.update(1000 / 60, input, createEmptyPlayerInput(), true);
    }

    expect(runtime.getState()?.player2.health).toBeLessThan(startingHealth as number);
  });

  it('switches AI profiles between campaign encounters', () => {
    const runtime = createFightRuntime();
    runtime.reset({ player1: 'camus', player2: 'machiavelli' }, { player2AIDifficulty: 'hard' });

    expect(runtime.getPlayer2AIDifficulty()).toBe('hard');
  });

  it('drives both fighters in AI showcase mode', () => {
    const runtime = createFightRuntime();
    runtime.reset(
      { player1: 'camus', player2: 'nietzsche' },
      { player1AIDifficulty: 'medium', player2AIDifficulty: 'medium' }
    );
    const input = createEmptyPlayerInput();
    const startingPlayer1X = runtime.getState()?.player1.x;
    const startingPlayer2X = runtime.getState()?.player2.x;

    for (let frame = 0; frame < 20; frame++) {
      runtime.update(1000 / 60, input, input, true, true);
    }

    const state = runtime.getState();
    expect(state?.player1.x).toBeGreaterThan(startingPlayer1X as number);
    expect(state?.player2.x).toBeLessThan(startingPlayer2X as number);
    expect(runtime.getPlayer1AIDifficulty()).toBe('medium');
    expect(runtime.getPlayer2AIDifficulty()).toBe('medium');
  });
});
