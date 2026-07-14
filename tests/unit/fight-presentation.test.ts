import { createFightRuntime } from '@/app/fight-runtime';
import { getCharacter } from '@/content/characters/character-data';
import type { Fighter } from '@/game/fight/fighter';
import {
  calculateWrappedParallaxX,
  getGraphicsBackendStatus,
  resolveAttackTelegraph,
  resolveCombatScreenFeedback,
  resolveFightGraphicsProfile,
} from '@/render/fight-presentation';
import { describe, expect, it } from 'vitest';

describe('Badger-compatible fight presentation contract', () => {
  it('reports the current renderer honestly and keeps the presentation renderer-neutral', () => {
    expect(getGraphicsBackendStatus()).toEqual({
      backend: 'canvas2d',
      pixiInstalled: false,
      rendererNeutralPresentation: true,
    });
  });

  it('resolves distinct Babylon profiles and clamps out-of-range encounters', () => {
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 0 }).id).toBe(
      'babylon_market'
    );
    expect(
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 0 }).foregroundMotif
    ).toBe('market_awning');
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 1 }).id).toBe(
      'babylon_archive'
    );
    expect(
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 1 }).foregroundMotif
    ).toBe('archive_columns');
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 99 }).id).toBe(
      'babylon_gate'
    );
    expect(
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 99 }).foregroundMotif
    ).toBe('gate_braziers');
    expect(resolveFightGraphicsProfile({ theme: 'neon_arena' }).id).toBe('neon_arena');
  });

  it('wraps parallax layers without producing negative modulo gaps', () => {
    const x = calculateWrappedParallaxX(30, 900, 0.6, 1200, 160);
    expect(x).toBeGreaterThanOrEqual(-160);
    expect(x).toBeLessThan(1040);
    expect(calculateWrappedParallaxX(30 + 1200, 900, 0.6, 1200, 160)).toBe(x);
  });

  it('builds readable startup telegraphs and hides them during active frames', () => {
    const character = getCharacter('camus');
    const startupFighter = {
      state: 'attacking',
      attackFrame: 2,
      currentAttack: {
        id: 'test_attack',
        name: 'Premise Breaker',
        type: 'heavy',
        startup: 8,
      },
      character,
    } as Pick<Fighter, 'state' | 'currentAttack' | 'attackFrame' | 'character'>;

    const telegraph = resolveAttackTelegraph(startupFighter);
    expect(telegraph).not.toBeNull();
    expect(telegraph?.progress).toBeCloseTo(0.25);
    expect(telegraph?.color).toBe(character.colors.secondary);

    startupFighter.attackFrame = 8;
    expect(resolveAttackTelegraph(startupFighter)).toBeNull();
  });

  it('derives low-health and impact feedback from deterministic fight state', () => {
    const runtime = createFightRuntime();
    const state = runtime.getState();
    expect(state).not.toBeNull();
    if (!state) throw new Error('Missing fight state fixture');

    state.player1.health = state.player1.stats.maxHealth * 0.2;
    state.player1.hitstunFrames = 8;
    const feedback = resolveCombatScreenFeedback(state);
    expect(feedback.lowHealthAlpha).toBeGreaterThan(0);
    expect(feedback.impactAlpha).toBeGreaterThan(0);
    expect(feedback.dominantSide).toBe(1);
  });
});
