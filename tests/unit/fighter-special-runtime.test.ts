import { CHARACTERS } from '@/content/characters';
import { applyCombatIntent } from '@/game/fight/combat-intent';
import { resolveCombatCommand } from '@/game/fight/command-input';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

describe('fighter special runtime state', () => {
  it('spends real energy when command special starts', () => {
    const fighter = new Fighter('p1', 'camus', 1, CHARACTERS.camus, 0);
    const command = resolveCombatCommand({
      block: true,
      attackPressed: true,
      jumpPressed: false,
      horizontalDirection: 1,
    });
    expect(command).not.toBeNull();

    const before = fighter.specialState.currentEnergy;
    applyCombatIntent(fighter, {
      attackPressed: true,
      block: true,
      specialPressed: false,
      jumpPressed: false,
      command,
      currentFrame: 1,
    });

    expect(fighter.state).toBe('special');
    expect(fighter.specialState.currentEnergy).toBeLessThan(before);
    expect(fighter.specialState.cooldowns.camus_absurd_revolt_wave).toBeGreaterThan(0);
  });

  it('rejects locked command specials in actual fighter intent path', () => {
    const fighter = new Fighter('p1', 'camus', 1, CHARACTERS.camus, 0);
    fighter.specialState = { ...fighter.specialState, unlockedNodeIds: [] };
    const command = resolveCombatCommand({
      block: true,
      attackPressed: true,
      jumpPressed: false,
      horizontalDirection: 1,
    });

    applyCombatIntent(fighter, {
      attackPressed: true,
      block: true,
      specialPressed: false,
      jumpPressed: false,
      command,
      currentFrame: 1,
    });

    expect(fighter.state).not.toBe('special');
    expect(fighter.specialState.currentEnergy).toBe(fighter.specialState.maxEnergy);
  });

  it('ticks per-special cooldown state during fighter update', () => {
    const fighter = new Fighter('p1', 'camus', 1, CHARACTERS.camus, 0);
    fighter.specialState = { ...fighter.specialState, cooldowns: { test_special: 2 } };

    fighter.update(1, 0);
    expect(fighter.specialState.cooldowns).toEqual({ test_special: 1 });
    fighter.update(2, 0);
    expect(fighter.specialState.cooldowns).toEqual({});
  });
});
