import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { FRAME_DATA } from '@/game/fight/fighter-state';
import { getLaneY } from '@/game/physics/lanes';
import { describe, expect, it } from 'vitest';

const neutralInput: PlayerInput = {
  moveLeft: false,
  moveRight: false,
  moveUp: false,
  moveDown: false,
  jump: false,
  jumpPressed: false,
  attack: false,
  attackPressed: false,
  block: false,
  blockPressed: false,
  special: false,
  specialPressed: false,
};

function createControllerAtLane(startLane: 0 | 1 | 2 = 1) {
  const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, startLane);
  const opponent = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 760, 1);
  const controller = createFightController();
  controller.init(fighter, opponent);
  return { controller, fighter, opponent };
}

describe('fight physics feel', () => {
  it('accelerates grounded movement instead of applying full walk speed immediately', () => {
    const { controller, fighter } = createControllerAtLane();
    const startingX = fighter.x;

    controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    const firstStep = fighter.x - startingX;

    controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    const secondStep = fighter.x - startingX - firstStep;

    expect(firstStep).toBeGreaterThan(0);
    expect(firstStep).toBeLessThan(4.8);
    expect(secondStep).toBeGreaterThan(firstStep);
  });

  it('brakes grounded movement over multiple frames after input release', () => {
    const { controller, fighter } = createControllerAtLane();

    for (let frame = 0; frame < 4; frame++) {
      controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    }

    const beforeRelease = fighter.x;
    controller.update(16.667, neutralInput, neutralInput);
    const releaseStep = fighter.x - beforeRelease;

    expect(releaseStep).toBeGreaterThan(0);
    expect(releaseStep).toBeLessThan(4.8);
  });

  it('carries grounded momentum into a jump', () => {
    const { controller, fighter } = createControllerAtLane();

    for (let frame = 0; frame < 4; frame++) {
      controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    }

    controller.update(
      16.667,
      { ...neutralInput, moveRight: true, jumpPressed: true },
      neutralInput
    );

    expect(fighter.isGrounded).toBe(false);
    expect(fighter.velocityX).toBeGreaterThan(0);
  });
  it('does not promote held movement into a run without a fresh second tap', () => {
    const { controller, fighter } = createControllerAtLane();

    controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);

    expect(fighter.isRunning).toBe(false);
  });

  it('enters a run after a quick second directional tap', () => {
    const { controller, fighter } = createControllerAtLane();

    controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);
    controller.update(16.667, neutralInput, neutralInput);
    controller.update(16.667, { ...neutralInput, moveRight: true }, neutralInput);

    expect(fighter.isRunning).toBe(true);
  });

  it('decrements lane transition timing only once per frame', () => {
    const { controller, fighter } = createControllerAtLane();

    controller.update(16.667, { ...neutralInput, moveUp: true }, neutralInput);

    expect(fighter.laneChangeTimer).toBe(FRAME_DATA.LANE_CHANGE_DURATION - 1);
  });

  it('animates lane motion between source and target instead of snapping at the end', () => {
    const { controller, fighter } = createControllerAtLane(1);

    controller.update(16.667, { ...neutralInput, moveUp: true }, neutralInput);

    expect(fighter.getGroundY()).toBeLessThan(getLaneY(1));
    expect(fighter.getGroundY()).toBeGreaterThan(getLaneY(2));
  });

  it('requires a fresh vertical press for each lane change', () => {
    const { controller, fighter } = createControllerAtLane(0);

    for (let frame = 0; frame < FRAME_DATA.LANE_CHANGE_DURATION + 5; frame++) {
      controller.update(16.667, { ...neutralInput, moveUp: true }, neutralInput);
    }

    expect(fighter.lane).toBe(1);
    expect(fighter.targetLane).toBe(1);
    expect(fighter.laneChangeTimer).toBe(0);
  });

  it('transitions from jumping into falling before landing', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);

    fighter.velocityY = 2;
    fighter.isGrounded = false;
    fighter.setState('jumping');

    for (let frame = 0; frame < 4; frame++) {
      fighter.update(16.667, frame);
    }

    expect(fighter.state).toBe('falling');
    expect(fighter.isGrounded).toBe(false);
  });

  it('interrupts attacks when the fighter enters hitstun', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);
    fighter.startAttack(0);

    fighter.takeDamage(5, 0, 0, 10);

    expect(fighter.state).toBe('hitstun');
    expect(fighter.currentAttack).toBeNull();
    expect(fighter.getActiveHitbox()).toBeNull();
  });

  it('locks attack facing so active hitboxes do not flip mid-swing', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);
    fighter.facing = 'right';
    fighter.startAttack(0);

    if (!fighter.currentAttack) {
      throw new Error('expected attack to start');
    }

    fighter.attackFrame = fighter.currentAttack.startup;
    const originalHitbox = fighter.getActiveHitbox();
    if (!originalHitbox) {
      throw new Error('expected active hitbox during the active frames');
    }

    fighter.facing = 'left';
    const flippedHitbox = fighter.getActiveHitbox();
    if (!flippedHitbox) {
      throw new Error('expected active hitbox to remain active');
    }

    expect(flippedHitbox.knockbackX).toBe(originalHitbox.knockbackX);
    expect(flippedHitbox.x).toBe(originalHitbox.x);
  });
});
