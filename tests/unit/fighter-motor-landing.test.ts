import { createFightRuntime } from '@/app/fight-runtime';
import { applyFighterMotor } from '@/game/fight/fighter-motor';
import { describe, expect, it } from 'vitest';

describe('fighter motor landing transition', () => {
  it('returns a falling fighter to a controllable grounded state on contact', () => {
    const runtime = createFightRuntime();
    const state = runtime.getState();
    if (!state) throw new Error('Missing fight state fixture');
    const fighter = state.player1;

    fighter.forceState('falling');
    fighter.isGrounded = false;
    fighter.y = 0.2;
    fighter.velocityY = -2;
    fighter.moveVelocityX = 0;

    applyFighterMotor(fighter);

    expect(fighter.isGrounded).toBe(true);
    expect(fighter.state).toBe('idle');
    expect(fighter.landingFrames).toBeGreaterThan(0);
  });
});
