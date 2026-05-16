import {
  CHARACTERS,
  createCharacterAttack,
  getCharacter,
} from '@/content/characters/character-data';
import { createSpecialAttack } from '@/game/fight/combat-intent';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { resolveAttackMoveClass } from '@/game/fight/move-class-presets';
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

describe('content-level move class presets', () => {
  it('assigns declared move-class presets to roster-authored normals and specials', () => {
    const camusMedium = createCharacterAttack(CHARACTERS.camus, 1);
    if (!camusMedium) {
      throw new Error('expected roster-authored medium attack to exist');
    }

    expect(camusMedium.moveClassPreset).toBe('pressure_string');
    expect(resolveAttackMoveClass(camusMedium)).toEqual({
      launchClass: 'grounded',
      chipBlockProfile: 'pressure',
      counterHitProfile: 'frame_trap',
      laneReach: 'same_lane',
    });

    const machiavelliMedium = createCharacterAttack(CHARACTERS.machiavelli, 1);
    if (!machiavelliMedium) {
      throw new Error('expected launcher medium attack to exist');
    }

    expect(machiavelliMedium.moveClassPreset).toBe('launcher');
    expect(resolveAttackMoveClass(machiavelliMedium)).toEqual({
      launchClass: 'launcher',
      chipBlockProfile: 'standard',
      counterHitProfile: 'launcher_punish',
      laneReach: 'same_lane',
    });

    const leibnizSpecial = createSpecialAttack('leibniz', CHARACTERS.leibniz.special);
    expect(leibnizSpecial.moveClassPreset).toBe('cross_lane_arc');
    expect(resolveAttackMoveClass(leibnizSpecial)).toEqual({
      launchClass: 'pop_up',
      chipBlockProfile: 'standard',
      counterHitProfile: 'standard',
      laneReach: 'adjacent',
    });
  });

  it('lets roster-authored lane reach presets change live hit behavior without inline metadata', () => {
    const player1 = new Fighter('p1', 'leibniz', 1, getCharacter('leibniz'), 320, 1);
    const player2 = new Fighter('p2', 'diogenes', 2, getCharacter('diogenes'), 356, 2);
    const controller = createFightController();
    controller.init(player1, player2);

    const started = player1.startSpecial();
    expect(started).toBe(true);

    if (!player1.currentAttack) {
      throw new Error('expected roster-authored special to start');
    }

    expect(player1.currentAttack.moveClassPreset).toBe('cross_lane_arc');
    player1.attackFrame = player1.currentAttack.startup;

    stepFight(controller, 1);

    expect(player2.health).toBeLessThan(player2.stats.maxHealth);
  });
});
