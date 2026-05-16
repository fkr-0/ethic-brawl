import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
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

function createSimulation(
  player1Id: 'camus' | 'leibniz' | 'machiavelli' | 'diogenes' = 'camus',
  player2Id: 'camus' | 'leibniz' | 'machiavelli' | 'diogenes' = 'diogenes',
  player1X = 320,
  player2X = 372
) {
  const player1 = new Fighter('p1', player1Id, 1, getCharacter(player1Id), player1X, 1);
  const player2 = new Fighter('p2', player2Id, 2, getCharacter(player2Id), player2X, 1);
  const controller = createFightController();
  controller.init(player1, player2);
  return { controller, player1, player2 };
}

function stepFight(
  controller: ReturnType<typeof createFightController>,
  frames: number,
  input1: PlayerInput | ((frame: number) => PlayerInput),
  input2: PlayerInput | ((frame: number) => PlayerInput)
): void {
  for (let frame = 0; frame < frames; frame++) {
    controller.update(
      16.667,
      typeof input1 === 'function' ? input1(frame) : input1,
      typeof input2 === 'function' ? input2(frame) : input2
    );
  }
}

describe('fight simulation scenarios', () => {
  it('treats an early held block as a normal block instead of a perfect block', () => {
    const { controller, player2 } = createSimulation();

    stepFight(
      controller,
      12,
      (frame) => (frame === 0 ? { ...neutralInput, attackPressed: true } : neutralInput),
      { ...neutralInput, block: true }
    );

    expect(player2.health).toBeLessThan(player2.stats.maxHealth);
  });
  it('keeps a successful block in blocking state and pushes both fighters apart', () => {
    const { controller, player1, player2 } = createSimulation();
    const initialAttackerX = player1.x;
    const initialDefenderX = player2.x;

    stepFight(
      controller,
      12,
      (frame) => (frame === 0 ? { ...neutralInput, attackPressed: true } : neutralInput),
      { ...neutralInput, block: true }
    );

    expect(player2.state).toBe('blocking');
    expect(player2.health).toBeLessThan(player2.stats.maxHealth);
    expect(player2.health).toBeGreaterThan(player2.stats.maxHealth - 8);
    expect(player1.x).toBeLessThan(initialAttackerX);
    expect(player2.x).toBeGreaterThan(initialDefenderX);
  });

  it('launches grounded defenders on heavy hits instead of leaving them glued to the floor', () => {
    const { controller, player1, player2 } = createSimulation();
    player1.startAttack(2);
    if (!player1.currentAttack) {
      throw new Error('expected heavy attack to start');
    }
    player1.attackFrame = player1.currentAttack.startup;

    stepFight(controller, 2, neutralInput, neutralInput);

    expect(player2.state).toBe('hitstun');
    expect(player2.isGrounded).toBe(false);
    expect(player2.y).toBeGreaterThan(0);
  });

  it('does not let standard same-lane normals hit into adjacent lanes', () => {
    const { controller, player1, player2 } = createSimulation('camus', 'diogenes', 320, 356);
    player2.lane = 2;
    player2.targetLane = 2;
    player2.laneChangeStartLane = 2;

    player1.startAttack(0);
    if (!player1.currentAttack) {
      throw new Error('expected light attack to start');
    }
    player1.attackFrame = player1.currentAttack.startup;

    stepFight(controller, 1, neutralInput, neutralInput);

    expect(player2.health).toBe(player2.stats.maxHealth);
  });

  it('applies pressure block profiles through live combat instead of generic block rules', () => {
    const jabSim = createSimulation('camus', 'diogenes', 320, 356);
    stepFight(jabSim.controller, 5, neutralInput, { ...neutralInput, block: true });

    jabSim.player1.startAttack(0);
    if (!jabSim.player1.currentAttack) {
      throw new Error('expected jab to start');
    }
    jabSim.player1.attackFrame = jabSim.player1.currentAttack.startup;

    stepFight(jabSim.controller, 1, neutralInput, { ...neutralInput, block: true });

    const jabChip = jabSim.player2.stats.maxHealth - jabSim.player2.health;
    const jabBlockstun = jabSim.player2.blockstunFrames;

    const pressureSim = createSimulation('camus', 'diogenes', 320, 356);
    stepFight(pressureSim.controller, 5, neutralInput, { ...neutralInput, block: true });

    pressureSim.player1.startAttack(1);
    if (!pressureSim.player1.currentAttack) {
      throw new Error('expected pressure medium to start');
    }
    pressureSim.player1.attackFrame = pressureSim.player1.currentAttack.startup;

    stepFight(pressureSim.controller, 1, neutralInput, { ...neutralInput, block: true });

    const pressureChip = pressureSim.player2.stats.maxHealth - pressureSim.player2.health;

    expect(pressureSim.player2.blockstunFrames).toBeGreaterThan(jabBlockstun);
    expect(pressureChip).toBeGreaterThan(jabChip);
  });

  it('applies counter-hit profiles when a move catches an opponent during an attack', () => {
    const idleSim = createSimulation('camus', 'diogenes', 320, 356);
    idleSim.player1.startAttack(1);
    if (!idleSim.player1.currentAttack) {
      throw new Error('expected pressure medium to start');
    }
    idleSim.player1.attackFrame = idleSim.player1.currentAttack.startup;

    stepFight(idleSim.controller, 1, neutralInput, neutralInput);

    const idleDamage = idleSim.player2.stats.maxHealth - idleSim.player2.health;
    const idleHitstun = idleSim.player2.hitstunFrames;

    const counterSim = createSimulation('camus', 'diogenes', 320, 356);
    counterSim.player1.startAttack(1);
    counterSim.player2.startAttack(0);
    if (!counterSim.player1.currentAttack || !counterSim.player2.currentAttack) {
      throw new Error('expected both attacks to start');
    }
    counterSim.player1.attackFrame = counterSim.player1.currentAttack.startup;
    counterSim.player2.attackFrame = 1;

    stepFight(counterSim.controller, 1, neutralInput, neutralInput);

    const counterDamage = counterSim.player2.stats.maxHealth - counterSim.player2.health;

    expect(counterDamage).toBeGreaterThan(idleDamage);
    expect(counterSim.player2.hitstunFrames).toBeGreaterThan(idleHitstun);
  });

  it('lets launcher move classes pop grounded defenders airborne even on non-heavy normals', () => {
    const { controller, player1, player2 } = createSimulation('machiavelli', 'diogenes', 320, 356);
    player1.startAttack(1);
    if (!player1.currentAttack) {
      throw new Error('expected launcher medium to start');
    }
    player1.attackFrame = player1.currentAttack.startup;

    stepFight(controller, 2, neutralInput, neutralInput);

    expect(player2.state).toBe('hitstun');
    expect(player2.isGrounded).toBe(false);
    expect(player2.y).toBeGreaterThan(0);
  });

  it('starts specials through the combat gateway and prevents immediate reactivation during cooldown', () => {
    const { controller, player1 } = createSimulation('leibniz', 'diogenes', 320, 860);

    stepFight(
      controller,
      1,
      { ...neutralInput, specialPressed: true, special: true },
      neutralInput
    );

    expect(player1.state).toBe('special');
    expect(player1.currentAttack?.type).toBe('special');
    expect(player1.specialCooldown).toBe(player1.specialMaxCooldown - 1);

    const firstAttackId = player1.currentAttack?.id;

    stepFight(
      controller,
      2,
      { ...neutralInput, attackPressed: true, block: true, specialPressed: true, special: true },
      neutralInput
    );

    expect(player1.state).toBe('special');
    expect(player1.currentAttack?.id).toBe(firstAttackId);

    stepFight(controller, 90, neutralInput, neutralInput);
    expect(player1.currentAttack).toBeNull();
    expect(player1.specialCooldown).toBeGreaterThan(0);

    stepFight(
      controller,
      1,
      { ...neutralInput, specialPressed: true, special: true },
      neutralInput
    );

    expect(player1.state).not.toBe('special');
    expect(player1.currentAttack).toBeNull();
  });
});
