import { getCharacter } from '@/content/characters/character-data';
import { applyCombatIntent } from '@/game/fight/combat-intent';
import { resolveCombatCommand } from '@/game/fight/command-input';
import { Fighter } from '@/game/fight/fighter';
import { describe, expect, it } from 'vitest';

describe('command input', () => {
  it('resolves LF2-style block+direction+attack command', () => {
    const command = resolveCombatCommand({
      block: true,
      attackPressed: true,
      jumpPressed: false,
      horizontalDirection: -1,
    });

    expect(command).toEqual({ type: 'block_direction_attack', direction: 'left' });
  });

  it('maps diogenes left command attack to energy blast', () => {
    const fighter = new Fighter('p1', 'diogenes', 1, getCharacter('diogenes'), 240, 1);

    applyCombatIntent(fighter, {
      attackPressed: true,
      block: true,
      specialPressed: false,
      jumpPressed: false,
      command: { type: 'block_direction_attack', direction: 'left' },
      currentFrame: 0,
    });

    expect(fighter.currentAttack?.id).toBe('diogenes_energy_blast');
    expect(fighter.state).toBe('special');
  });

  it('maps diogenes right command attack to boulder roll', () => {
    const fighter = new Fighter('p1', 'diogenes', 1, getCharacter('diogenes'), 240, 1);

    applyCombatIntent(fighter, {
      attackPressed: true,
      block: true,
      specialPressed: false,
      jumpPressed: false,
      command: { type: 'block_direction_attack', direction: 'right' },
      currentFrame: 0,
    });

    expect(fighter.currentAttack?.id).toBe('diogenes_boulder_roll');
    expect(fighter.state).toBe('special');
  });
});
