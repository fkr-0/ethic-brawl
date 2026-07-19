import { createFightRuntime } from '@/app/fight-runtime';
import { applyFighterMotor, updateFighterMotorFromInput } from '@/game/fight/fighter-motor';
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

  it('buffers jump input shortly before landing and activates it on the next controllable frame', () => {
    const runtime = createFightRuntime();
    const state = runtime.getState();
    if (!state) throw new Error('Missing fight state fixture');
    const fighter = state.player1;

    fighter.forceState('falling');
    fighter.isGrounded = false;
    fighter.y = 0.2;
    fighter.velocityY = -2;

    updateFighterMotorFromInput(fighter, {
      horizontalDirection: 0,
      horizontalPressed: false,
      verticalDirection: 0,
      verticalPressed: false,
      jumpPressed: true,
      currentFrame: 1,
    });
    applyFighterMotor(fighter);
    expect(fighter.isGrounded).toBe(true);

    updateFighterMotorFromInput(fighter, {
      horizontalDirection: 0,
      horizontalPressed: false,
      verticalDirection: 0,
      verticalPressed: false,
      jumpPressed: false,
      currentFrame: 2,
    });

    expect(fighter.isGrounded).toBe(false);
    expect(fighter.state).toBe('jumping');
    expect(fighter.velocityY).toBeGreaterThan(0);
  });
});
