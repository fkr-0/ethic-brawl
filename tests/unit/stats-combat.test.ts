import { CHARACTERS } from '@/content/characters';
import {
  buildCharacterAbilities,
  buildCharacterStats,
} from '@/content/characters/character-loader';
import {
  type FighterCombatState,
  applyAgilityToFrames,
  calculateDamage,
  canUseSpecial,
  resolveHit,
} from '@/game/fight/combat';
import { createComboState } from '@/game/fight/combo';
import type { FighterStats } from '@/game/fight/fighter-state';
import { DEFAULT_FIGHTER_STATS } from '@/game/fight/fighter-state';
import type { ActiveHitbox } from '@/game/fight/hitbox';
import { describe, expect, it } from 'vitest';

function stats(overrides: Partial<FighterStats> = {}): FighterStats {
  return { ...DEFAULT_FIGHTER_STATS, ...overrides };
}

function combatState(overrides: Partial<FighterCombatState> = {}): FighterCombatState {
  const base: FighterCombatState = {
    x: 0,
    y: 0,
    lane: 1,
    health: 100,
    maxHealth: 100,
    stats: stats(),
    isBlocking: false,
    blockStartedFrame: 0,
    facing: 'right',
    state: 'idle',
    stateFrame: 0,
    velocityX: 0,
    velocityY: 0,
    hitstunFrames: 0,
    isGrounded: true,
    combo: createComboState(),
    currentAttackId: null,
    attackFrame: 0,
    abilities: [],
  };

  return { ...base, ...overrides };
}

function hitbox(overrides: Partial<ActiveHitbox> = {}): ActiveHitbox {
  return {
    x: 0,
    y: 0,
    width: 80,
    height: 80,
    damage: 10,
    hitstun: 12,
    knockbackX: 2,
    knockbackY: 0,
    type: 'light',
    owner: 'attacker',
    moveClass: {
      laneReach: 'same_lane',
      launchClass: 'grounded',
      chipBlockProfile: 'standard',
      counterHitProfile: 'standard',
    },
    ...overrides,
  };
}

describe('expanded stats and ability combat integration', () => {
  it('strength and intelligence increase outgoing damage', () => {
    const baseline = calculateDamage(10, stats({ strength: 1, intelligence: 1 }), stats(), false);
    const stronger = calculateDamage(10, stats({ strength: 10, intelligence: 10 }), stats(), false);

    expect(stronger).toBeGreaterThan(baseline);
  });

  it('defense and vitality reduce incoming damage', () => {
    const fragile = calculateDamage(
      20,
      stats({ strength: 5 }),
      stats({ defense: 1, vitality: 1 }),
      false
    );
    const sturdy = calculateDamage(
      20,
      stats({ strength: 5 }),
      stats({ defense: 10, vitality: 10 }),
      false
    );

    expect(sturdy).toBeLessThan(fragile);
  });

  it('agility shortens frame timings with a minimum of one frame', () => {
    expect(applyAgilityToFrames(20, 10)).toBeLessThan(applyAgilityToFrames(20, 1));
    expect(applyAgilityToFrames(1, 99)).toBe(1);
  });

  it('energy lowers special-use threshold', () => {
    expect(canUseSpecial(stats({ energy: 1 }), 5)).toBe(false);
    expect(canUseSpecial(stats({ energy: 10 }), 5)).toBe(true);
  });

  it('loads full stat blocks and abilities from prompt character metadata', () => {
    expect(buildCharacterStats('camus', 100)).toMatchObject({
      health: 100,
      maxHealth: 100,
      intelligence: 8,
      vitality: 6,
      energy: 7,
    });
    expect(buildCharacterAbilities('socrates')).toEqual(['elenchus_reflect']);
    expect(CHARACTERS.camus.baseStats.maxHealth).toBe(100);
  });

  it('runs on-hit abilities during hit resolution', () => {
    const attacker = combatState({
      abilities: ['elenchus_reflect'],
      stats: stats({ intelligence: 10 }),
    });
    const defender = combatState({ health: 100, x: 10 });

    const result = resolveHit(
      attacker,
      defender,
      hitbox(),
      { x: 10, y: 0, width: 50, height: 100 },
      30
    );

    expect(result.type).toBe('hit');
    expect(defender.health).toBe(98);
  });
});
