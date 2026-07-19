import { createFightRuntime } from '@/app/fight-runtime';
import { FRAME_DATA } from '@/game/fight/fighter-state';
import { createFighterAnimationView } from '@/render/fighter-animation-view';
import { describe, expect, it } from 'vitest';

describe('fighter animation view', () => {
  it('authors readable jump, landing, turnaround, and get-up motion states', () => {
    const runtime = createFightRuntime();
    const state = runtime.getState();
    if (!state) throw new Error('Missing fight state fixture');
    const fighter = state.player1;

    fighter.isGrounded = false;
    fighter.forceState('jumping');
    fighter.velocityY = FRAME_DATA.JUMP_VELOCITY * 0.65;
    const jump = createFighterAnimationView(fighter, 20);
    expect(jump.bodyHeightScale).toBeGreaterThan(jump.bodyWidthScale);
    expect(jump.shadowScaleX).toBeLessThan(jump.depthScale);

    fighter.isGrounded = true;
    fighter.forceState('idle');
    fighter.triggerLanding(1);
    const landing = createFighterAnimationView(fighter, 30);
    expect(landing.landingImpact).toBeGreaterThan(0);
    expect(landing.bodyWidthScale).toBeGreaterThan(1);
    expect(landing.bodyHeightScale).toBeLessThan(1);

    fighter.setFacing('left');
    fighter.turnaroundFrames = Math.floor(FRAME_DATA.TURNAROUND_DURATION / 2);
    const turn = createFighterAnimationView(fighter, 40);
    expect(turn.turnaroundAmount).toBeGreaterThan(0);
    expect(Math.abs(turn.bodyTwist)).toBeGreaterThan(0.05);

    fighter.forceState('gettingUp');
    fighter.stateFrame = Math.floor(FRAME_DATA.GET_UP_DURATION / 2);
    const getUp = createFighterAnimationView(fighter, 50);
    expect(getUp.bodyHeightScale).toBeGreaterThan(0.62);
    expect(getUp.bodyHeightScale).toBeLessThan(1.05);
  });

  it('adds deterministic anticipation, lunge, blur, and recovery overshoot to attacks', () => {
    const runtime = createFightRuntime();
    const state = runtime.getState();
    if (!state) throw new Error('Missing fight state fixture');
    const fighter = state.player1;
    expect(fighter.startAttack(0, 0)).toBe(true);
    if (!fighter.currentAttack) throw new Error('Missing attack fixture');

    fighter.attackFrame = Math.max(0, fighter.currentAttack.startup - 2);
    const startup = createFighterAnimationView(fighter, 12);
    expect(startup.actionOffsetX).toBeLessThan(0);
    expect(startup.motionBlur).toBe(0);

    fighter.attackFrame =
      fighter.currentAttack.startup + Math.max(0, Math.floor(fighter.currentAttack.active / 2));
    const active = createFighterAnimationView(fighter, 18);
    expect(active.actionOffsetX).toBeGreaterThan(8);
    expect(active.motionBlur).toBeGreaterThan(0.3);
    expect(active.impactPulse).toBeGreaterThan(0);

    fighter.attackFrame =
      fighter.currentAttack.startup +
      fighter.currentAttack.active +
      fighter.currentAttack.recovery -
      2;
    const recovery = createFighterAnimationView(fighter, 30);
    expect(Math.abs(recovery.actionOffsetX)).toBeLessThan(active.actionOffsetX);
    expect(recovery.motionBlur).toBeLessThan(active.motionBlur);
  });
});
