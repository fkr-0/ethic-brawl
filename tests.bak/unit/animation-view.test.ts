import { getCharacter } from '@/content/characters/character-data';
import { Fighter } from '@/game/fight/fighter';
import { createStableBackgroundScene } from '@/render/background-scene';
import { createFighterAnimationView } from '@/render/fighter-animation-view';
import { describe, expect, it } from 'vitest';

describe('fighter animation view', () => {
  it('scales depth and locomotion amplitude from lane and movement state', () => {
    const frontRunner = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 0);
    frontRunner.setState('running');
    frontRunner.moveVelocityX = 6;

    const backWalker = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 200, 2);
    backWalker.setState('walking');
    backWalker.moveVelocityX = 2;

    const frontView = createFighterAnimationView(frontRunner, 24);
    const backView = createFighterAnimationView(backWalker, 24);

    expect(frontView.depthScale).toBeGreaterThan(backView.depthScale);
    expect(frontView.legSwing).toBeGreaterThan(backView.legSwing);
    expect(frontView.afterImageAlpha).toBeGreaterThan(0);
    expect(backView.afterImageAlpha).toBe(0);
  });

  it('separates startup, active, and recovery into distinct attack silhouettes', () => {
    const fighter = new Fighter('p1', 'machiavelli', 1, getCharacter('machiavelli'), 200, 1);
    fighter.startAttack(1);

    if (!fighter.currentAttack) {
      throw new Error('expected attack to start');
    }

    fighter.attackFrame = fighter.currentAttack.startup - 1;
    const startupView = createFighterAnimationView(fighter, 10);

    fighter.attackFrame = fighter.currentAttack.startup + 1;
    const activeView = createFighterAnimationView(fighter, 10);

    fighter.attackFrame = fighter.currentAttack.startup + fighter.currentAttack.active + 1;
    const recoveryView = createFighterAnimationView(fighter, 10);

    expect(startupView.attackPhase).toBe('startup');
    expect(activeView.attackPhase).toBe('active');
    expect(recoveryView.attackPhase).toBe('recovery');
    expect(activeView.frontArmReach).toBeGreaterThan(startupView.frontArmReach);
    expect(activeView.frontArmReach).toBeGreaterThan(recoveryView.frontArmReach);
    expect(startupView.bodyLean).toBeLessThan(activeView.bodyLean);
    expect(recoveryView.bodyLean).toBeLessThan(activeView.bodyLean);
  });

  it('surfaces readable guard and hit reactions for defense states', () => {
    const blockingFighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);
    blockingFighter.startBlocking(100);
    const blockView = createFighterAnimationView(blockingFighter, 100);

    const hitFighter = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 200, 1);
    hitFighter.takeDamage(5, -4, 0, 12);
    const hitView = createFighterAnimationView(hitFighter, 100);

    expect(blockView.guardArc).toBeGreaterThan(0.5);
    expect(blockView.flashColor).toBe('#00F5FF');
    expect(hitView.guardArc).toBe(0);
    expect(hitView.flashColor).toBe('#FF073A');
    expect(hitView.bodyLean).toBeLessThan(0);
    expect(hitView.headOffsetY).toBeGreaterThan(blockView.headOffsetY);
  });

  it('adds landing, turnaround, and recoil transition timers to the view layer', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);

    fighter.isGrounded = false;
    fighter.state = 'falling';
    fighter.y = 0.2;
    fighter.velocityY = -3;
    fighter.update(16, 0);
    fighter.setFacing('left');
    fighter.takeBlockedHit(1, -3, 6);

    const view = createFighterAnimationView(fighter, 12);

    expect(fighter.landingFrames).toBeGreaterThan(0);
    expect(fighter.turnaroundFrames).toBeGreaterThan(0);
    expect(fighter.recoilFrames).toBeGreaterThan(0);
    expect(view.landingImpact).toBeGreaterThan(0);
    expect(view.turnaroundAmount).toBeGreaterThan(0);
    expect(Math.abs(view.recoilOffsetX)).toBeGreaterThan(0);
  });

  it('uses inbetween interpolation within attack phases instead of snapping to one pose per phase', () => {
    const fighter = new Fighter('p1', 'machiavelli', 1, getCharacter('machiavelli'), 200, 1);
    fighter.startAttack(1);

    if (!fighter.currentAttack) {
      throw new Error('expected attack to start');
    }

    fighter.attackFrame = 1;
    const earlyStartup = createFighterAnimationView(fighter, 20);

    fighter.attackFrame = Math.max(2, fighter.currentAttack.startup - 1);
    const lateStartup = createFighterAnimationView(fighter, 20);

    fighter.attackFrame = fighter.currentAttack.startup;
    const earlyActive = createFighterAnimationView(fighter, 20);

    fighter.attackFrame =
      fighter.currentAttack.startup + Math.max(1, fighter.currentAttack.active - 1);
    const lateActive = createFighterAnimationView(fighter, 20);

    expect(lateStartup.frontArmReach).toBeGreaterThan(earlyStartup.frontArmReach);
    expect(lateStartup.bodyLean).toBeGreaterThan(earlyStartup.bodyLean);
    expect(lateActive.frontArmReach).not.toBe(earlyActive.frontArmReach);
    expect(lateActive.bodyTwist).not.toBe(earlyActive.bodyTwist);
  });
});

it('applies character-specific animation profiles so different fighters read differently in the same state', () => {
  const camus = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);
  camus.setState('walking');
  camus.moveVelocityX = 3.5;

  const diogenes = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 200, 1);
  diogenes.setState('walking');
  diogenes.moveVelocityX = 3.5;

  const camusView = createFighterAnimationView(camus, 42);
  const diogenesView = createFighterAnimationView(diogenes, 42);

  expect(camusView.headScaleY).not.toBe(diogenesView.headScaleY);
  expect(camusView.frontArmReach).not.toBe(diogenesView.frontArmReach);
  expect(camusView.bodyLean).not.toBe(diogenesView.bodyLean);
});

it('maps knockdown and get-up into distinct recovery families', () => {
  const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);
  fighter.state = 'knockdown';
  const knockedDownView = createFighterAnimationView(fighter, 12);

  fighter.state = 'gettingUp';
  fighter.stateFrame = 8;
  const gettingUpView = createFighterAnimationView(fighter, 12);

  expect(knockedDownView.bodyHeightScale).toBeLessThan(0.7);
  expect(knockedDownView.shadowScaleX).toBeGreaterThan(gettingUpView.shadowScaleX);
  expect(gettingUpView.bodyHeightScale).toBeGreaterThan(knockedDownView.bodyHeightScale);
  expect(gettingUpView.headOffsetY).toBeLessThan(knockedDownView.headOffsetY);
});

it('adds bounded micro-timing variation between repeated attacks of the same move', () => {
  const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);

  fighter.startAttack(0);
  fighter.attackFrame = 3;
  const firstView = createFighterAnimationView(fighter, 18);

  fighter.currentAttack = null;
  fighter.attackFacing = null;
  fighter.forceState('idle');
  fighter.startAttack(0);
  fighter.attackFrame = 3;
  const secondView = createFighterAnimationView(fighter, 18);

  expect(firstView.frontArmReach).not.toBe(secondView.frontArmReach);
  expect(Math.abs(firstView.frontArmReach - secondView.frontArmReach)).toBeLessThan(0.18);
  expect(Math.abs(firstView.bodyLean - secondView.bodyLean)).toBeLessThan(0.12);
});

describe('stable background scene', () => {
  it('builds deterministic window patterns from a seed', () => {
    const sceneA = createStableBackgroundScene(1337);
    const sceneB = createStableBackgroundScene(1337);
    const sceneC = createStableBackgroundScene(7);

    expect(sceneA).toEqual(sceneB);
    expect(sceneA.midBuildings[0]?.windows).not.toEqual(sceneC.midBuildings[0]?.windows);
  });
});
