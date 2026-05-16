import {
  CHARACTERS,
  createCharacterAttack,
  getCharacter,
} from '@/content/characters/character-data';
import { createSpecialAttack } from '@/game/fight/combat-intent';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { resolveAttackHitPolicy } from '@/game/fight/hit-confirm';
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

describe('content-level hit policy presets', () => {
  it('assigns declared presets to roster-authored normals and specials', () => {
    const machiavelliAttack = createCharacterAttack(CHARACTERS.machiavelli, 1);
    if (!machiavelliAttack) {
      throw new Error('expected roster-authored medium attack to exist');
    }

    expect(machiavelliAttack.hitPolicyPreset).toBe('double_tap');
    expect(machiavelliAttack.hitPolicy).toBeUndefined();
    expect(resolveAttackHitPolicy(machiavelliAttack)).toEqual({
      maxHitsPerTarget: 2,
      rehitDelayFrames: 2,
    });

    const leibnizSpecial = createSpecialAttack('leibniz', CHARACTERS.leibniz.special);
    expect(leibnizSpecial.hitPolicyPreset).toBe('double_tap');
    expect(resolveAttackHitPolicy(leibnizSpecial)).toEqual({
      maxHitsPerTarget: 2,
      rehitDelayFrames: 2,
    });
  });

  it('lets roster-authored normal presets drive multi-hit behavior without inline metadata', () => {
    const player1 = new Fighter('p1', 'machiavelli', 1, getCharacter('machiavelli'), 320, 1);
    const player2 = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 352, 1);
    const controller = createFightController();
    controller.init(player1, player2);

    const started = player1.startAttack(1);
    expect(started).toBe(true);

    if (!player1.currentAttack) {
      throw new Error('expected roster-authored medium attack to start');
    }

    expect(player1.currentAttack.hitPolicyPreset).toBe('double_tap');
    expect(player1.currentAttack.hitPolicy).toBeUndefined();

    player1.attackFrame = player1.currentAttack.startup;

    stepFight(controller, 1);
    const healthAfterFirstHit = player2.health;

    stepFight(controller, 1);
    expect(player2.health).toBe(healthAfterFirstHit);

    stepFight(controller, 1);
    expect(player2.health).toBeLessThan(healthAfterFirstHit);
  });
});
