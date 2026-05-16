import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import type { AttackData } from '@/game/fight/fighter-state';
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

function createSimulation(player1X = 320, player2X = 350) {
  const player1 = new Fighter('p1', 'camus', 1, getCharacter('camus'), player1X, 1);
  const player2 = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), player2X, 1);
  const controller = createFightController();
  controller.init(player1, player2);
  return { controller, player1, player2 };
}

function primeAttack(fighter: Fighter, attack: AttackData): void {
  const started = fighter.startAttack(0);
  if (!started) {
    throw new Error('expected attack startup to succeed');
  }

  fighter.currentAttack = attack;
  fighter.attackFrame = attack.startup;
}

function stepFight(
  controller: ReturnType<typeof createFightController>,
  frames: number,
  input1: PlayerInput = neutralInput,
  input2: PlayerInput = neutralInput
): void {
  for (let frame = 0; frame < frames; frame++) {
    controller.update(16.667, input1, input2);
  }
}

describe('attack hit confirmation ownership', () => {
  it('does not repeatedly damage the same target across one active window by default', () => {
    const { controller, player1, player2 } = createSimulation();

    primeAttack(player1, {
      id: 'single_hit_window',
      name: 'Single Hit Window',
      damage: 7,
      hitstun: 4,
      knockbackX: 0,
      knockbackY: 0,
      range: 120,
      startup: 0,
      active: 4,
      recovery: 0,
      type: 'light',
      hitbox: {
        offsetX: 0,
        offsetY: -80,
        width: 120,
        height: 80,
      },
    });

    stepFight(controller, 1);
    const healthAfterFirstHit = player2.health;

    stepFight(controller, 3);

    expect(healthAfterFirstHit).toBeLessThan(player2.stats.maxHealth);
    expect(player2.health).toBe(healthAfterFirstHit);
  });

  it('allows authored multi-hit attacks to reconnect after their rehit delay', () => {
    const { controller, player1, player2 } = createSimulation();

    primeAttack(player1, {
      id: 'authored_multi_hit',
      name: 'Authored Multi Hit',
      damage: 5,
      hitstun: 2,
      knockbackX: 0,
      knockbackY: 0,
      range: 120,
      startup: 0,
      active: 5,
      recovery: 0,
      type: 'light',
      hitPolicy: {
        maxHitsPerTarget: 2,
        rehitDelayFrames: 2,
      },
      hitbox: {
        offsetX: 0,
        offsetY: -80,
        width: 120,
        height: 80,
      },
    });

    stepFight(controller, 1);
    const healthAfterFirstHit = player2.health;

    stepFight(controller, 1);
    expect(player2.health).toBe(healthAfterFirstHit);

    stepFight(controller, 1);
    const healthAfterSecondHit = player2.health;

    expect(healthAfterSecondHit).toBeLessThan(healthAfterFirstHit);

    stepFight(controller, 2);
    expect(player2.health).toBe(healthAfterSecondHit);
  });
});
