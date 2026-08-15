import { getCharacter } from '@/content/characters/character-data';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

describe('fighter shared action phases', () => {
  it('drives active hitboxes, outcomes, and completion through the runtime phase state', () => {
    const fighter = new Fighter('phase-fighter', 'camus', 1, getCharacter('camus'), 240, 1);
    expect(fighter.startAttack(0, 0)).toBe(true);
    const attack = fighter.currentAttack;
    expect(attack).not.toBeNull();
    if (!attack) throw new Error('missing attack fixture');

    expect(fighter.attackPhaseState?.phase).toBe(attack.startup > 0 ? 'startup' : 'active');
    expect(fighter.getActiveHitbox()).toBe(attack.startup > 0 ? null : expect.any(Object));

    for (let frame = 1; frame <= attack.startup; frame++) fighter.update(1000 / 60, frame);
    expect(fighter.attackPhaseState?.phase).toBe('active');
    expect(fighter.getActiveHitbox()).not.toBeNull();

    fighter.markAttackOutcome('block');
    expect(fighter.attackPhaseState).toMatchObject({ lastOutcome: 'block', hitConfirmed: false });
    fighter.markAttackOutcome('hit');
    expect(fighter.attackPhaseState).toMatchObject({ lastOutcome: 'hit', hitConfirmed: true });

    const remaining = attack.active + attack.recovery;
    for (let frame = 1; frame <= remaining; frame++) {
      fighter.update(1000 / 60, attack.startup + frame);
    }
    expect(fighter.currentAttack).toBeNull();
    expect(fighter.attackPhaseState).toBeNull();
    expect(fighter.attackFrame).toBe(0);
  });

  it('buffers a normal press and cancels confirmed recovery into the next authored strike', () => {
    const fighter = new Fighter('buffer-fighter', 'foucault', 1, getCharacter('foucault'), 240, 1);
    expect(fighter.startAttack(0, 0)).toBe(true);
    const first = fighter.currentAttack;
    if (!first) throw new Error('missing first attack fixture');

    for (let frame = 1; frame <= first.startup; frame++) fighter.update(1000 / 60, frame);
    fighter.markAttackOutcome('hit');
    fighter.bufferNormalAttack();

    let frame = first.startup;
    while (fighter.currentAttack?.id === first.id && frame < 120) {
      frame++;
      fighter.update(1000 / 60, frame);
    }

    expect(fighter.currentAttack?.id).toBe('foucault_archive_hook');
    expect(fighter.attackFrame).toBe(0);
    expect(fighter.state).toBe('attacking');
    expect(fighter.bufferedAttackFrames).toBe(0);
  });

  it('retains a late whiff press through recovery and starts the next strike on completion', () => {
    const fighter = new Fighter('whiff-buffer', 'foucault', 1, getCharacter('foucault'), 240, 1);
    expect(fighter.startAttack(0, 0)).toBe(true);
    const first = fighter.currentAttack;
    if (!first) throw new Error('missing first attack fixture');

    const totalFrames = first.startup + first.active + first.recovery;
    for (let frame = 1; frame < totalFrames - 2; frame++) fighter.update(1000 / 60, frame);
    fighter.bufferNormalAttack();
    fighter.update(1000 / 60, totalFrames - 1);
    fighter.update(1000 / 60, totalFrames);
    fighter.update(1000 / 60, totalFrames + 1);

    expect(fighter.currentAttack?.id).toBe('foucault_archive_hook');
    expect(fighter.state).toBe('attacking');
  });
});
