import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { FRAME_DATA } from '@/game/fight/fighter-state';
import { describe, expect, it } from 'vitest';

const EMPTY_INPUT: PlayerInput = {
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

describe('fighter evasive roll', () => {
  it('moves in the run direction and exposes only the authored middle invulnerability window', () => {
    const fighter = new Fighter('roller', 'camus', 1, getCharacter('camus'), 300, 1);
    fighter.isRunning = true;
    fighter.lastDirection = 'right';

    expect(fighter.startRoll()).toBe(true);
    expect(fighter.invulnerableFrames).toBe(0);
    const startX = fighter.x;

    for (let frame = 0; frame <= FRAME_DATA.ROLL_INVULN_START; frame++) {
      fighter.update(1000 / 60, frame);
    }
    expect(fighter.x).toBeGreaterThan(startX);
    expect(fighter.invulnerableFrames).toBe(1);

    while (fighter.rollFrames > 0) fighter.update(1000 / 60, 100);
    expect(fighter.invulnerableFrames).toBe(0);
    expect(fighter.state).toBe('idle');
    expect(fighter.startRoll()).toBe(false);
  });

  it('starts from a fresh block press while running and cannot attack during the roll', () => {
    const controller = createFightController();
    const player1 = new Fighter('p1', 'camus', 1, getCharacter('camus'), 300, 1);
    const player2 = new Fighter('p2', 'machiavelli', 2, getCharacter('machiavelli'), 700, 1);
    controller.init(player1, player2);
    player1.isRunning = true;
    player1.lastDirection = 'right';
    player1.forceState('running');

    controller.update(1000 / 60, {
      ...EMPTY_INPUT,
      moveRight: true,
      block: true,
      blockPressed: true,
      attack: true,
      attackPressed: true,
    });

    expect(player1.rollFrames).toBeGreaterThan(0);
    expect(player1.currentAttack).toBeNull();
    expect(player1.isBlocking).toBe(false);
  });
});
