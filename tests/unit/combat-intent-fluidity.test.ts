import { getCharacter } from '@/content/characters/character-data';
import { applyCombatIntent } from '@/game/fight/combat-intent';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

const neutralIntent = {
  attackPressed: false,
  block: false,
  specialPressed: false,
  jumpPressed: false,
  command: null,
  currentFrame: 0,
};

describe('combat intent fluidity', () => {
  it('allows the authored normal attack while rising or falling', () => {
    for (const state of ['jumping', 'falling'] as const) {
      const fighter = new Fighter(`air-${state}`, 'foucault', 1, getCharacter('foucault'), 240, 1);
      fighter.forceState(state);
      fighter.isGrounded = false;

      applyCombatIntent(fighter, {
        ...neutralIntent,
        attackPressed: true,
        currentFrame: 12,
      });

      expect(fighter.state).toBe('attacking');
      expect(fighter.currentAttack?.type).toBe('light');
    }
  });

  it('allows a confirmed normal to cancel into a special when recovery begins', () => {
    const fighter = new Fighter('special-cancel', 'foucault', 1, getCharacter('foucault'), 240, 1);
    expect(fighter.startAttack(0, 0)).toBe(true);
    const attack = fighter.currentAttack;
    if (!attack) throw new Error('missing attack fixture');

    for (let frame = 1; frame <= attack.startup; frame++) fighter.update(1000 / 60, frame);
    fighter.markAttackOutcome('hit');
    for (
      let frame = attack.startup + 1;
      fighter.attackPhaseState?.phase !== 'recovery' && frame < 120;
      frame++
    ) {
      fighter.update(1000 / 60, frame);
    }

    expect(fighter.attackPhaseState?.phase).toBe('recovery');
    applyCombatIntent(fighter, {
      ...neutralIntent,
      specialPressed: true,
      currentFrame: 42,
    });

    expect(fighter.state).toBe('special');
    expect(fighter.currentAttack?.type).toBe('special');
    expect(fighter.currentAttack?.id).toBe('special_foucault');
  });
});
