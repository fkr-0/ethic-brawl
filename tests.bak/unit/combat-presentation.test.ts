import { getCharacter } from '@/content/characters/character-data';
import { type PlayerInput, createFightController } from '@/game/fight/fight-controller';
import { Fighter } from '@/game/fight/fighter';
import { FRAME_DATA } from '@/game/fight/fighter-state';
import { collectAmbientEffectsForFighter } from '@/render/vfx';
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
  player2X = 356
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

describe('combat presentation systems', () => {
  it('spawns impact vfx and applies hit-freeze without advancing fighter simulation during freeze frames', () => {
    const { controller, player1 } = createSimulation('camus', 'diogenes', 320, 356);
    player1.startAttack(0);
    if (!player1.currentAttack) {
      throw new Error('expected jab to start');
    }
    player1.attackFrame = player1.currentAttack.startup;

    controller.update(16.667, neutralInput, neutralInput);
    const stateAfterHit = controller.getState();

    expect(stateAfterHit?.hitFreezeFrames).toBeGreaterThan(0);
    expect(stateAfterHit?.visualEffects.some((effect) => effect.preset === 'hit_spark_light')).toBe(
      true
    );

    const frozenAttackFrame = player1.attackFrame;
    const frozenStateFrame = player1.stateFrame;

    controller.update(16.667, neutralInput, neutralInput);

    expect(player1.attackFrame).toBe(frozenAttackFrame);
    expect(player1.stateFrame).toBe(frozenStateFrame);
  });

  it('runs launched defenders through knockdown, getting-up, and back to idle', () => {
    const { controller, player1, player2 } = createSimulation('machiavelli', 'diogenes', 320, 356);
    player1.startAttack(1);
    if (!player1.currentAttack) {
      throw new Error('expected launcher medium to start');
    }
    player1.attackFrame = player1.currentAttack.startup;

    stepFight(controller, 20, neutralInput, neutralInput);

    expect(player2.state).toBe('knockdown');

    stepFight(controller, FRAME_DATA.KNOCKDOWN_DURATION, neutralInput, neutralInput);
    expect(player2.state).toBe('gettingUp');

    stepFight(controller, FRAME_DATA.GET_UP_DURATION + 2, neutralInput, neutralInput);
    expect(player2.state).toBe('idle');
    expect(player2.isGrounded).toBe(true);
  });

  it('emits ambient no-move vfx presets and varies them by fighter state and character identity', () => {
    const idleCamus = new Fighter('p1', 'camus', 1, getCharacter('camus'), 200, 1);
    const idleLeibniz = new Fighter('p2', 'leibniz', 2, getCharacter('leibniz'), 200, 1);
    const specialLeibniz = new Fighter('p3', 'leibniz', 1, getCharacter('leibniz'), 200, 1);
    specialLeibniz.startSpecial();

    const camusEffects = collectAmbientEffectsForFighter(idleCamus, 48);
    const leibnizEffects = collectAmbientEffectsForFighter(idleLeibniz, 48);
    const specialEffects = collectAmbientEffectsForFighter(specialLeibniz, 48);

    expect(camusEffects.length).toBeGreaterThan(0);
    expect(leibnizEffects.length).toBeGreaterThan(0);
    expect(camusEffects[0]?.preset).not.toBe(leibnizEffects[0]?.preset);
    expect(specialEffects.some((effect) => effect.preset === 'special_monad_orbit')).toBe(true);
  });
});
