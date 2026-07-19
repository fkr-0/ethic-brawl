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
});
