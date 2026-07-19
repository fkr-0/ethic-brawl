import { createFightRuntime } from '@/app/fight-runtime';
import { getCharacter } from '@/content/characters/character-data';
import type { Fighter } from '@/game/fight/fighter';
import {
  calculateWrappedParallaxX,
  getGraphicsBackendStatus,
  resolveAttackTelegraph,
  resolveCombatScreenFeedback,
  resolveFightGraphicsProfile,
  resolveFightStageEvent,
  resolveFightStageReaction,
} from '@/render/fight-presentation';
import { describe, expect, it } from 'vitest';

describe('Badger-compatible fight presentation contract', () => {
  it('reports the current renderer honestly and keeps the presentation renderer-neutral', () => {
    expect(getGraphicsBackendStatus()).toEqual({
      backend: 'canvas2d',
      pixiInstalled: true,
      rendererNeutralPresentation: true,
      bridgeEnabled: false,
    });
    expect(getGraphicsBackendStatus(true).backend).toBe('pixi-canvas-bridge');
  });

  it('raises crowd and lighting response for combos, impacts, and low-health pressure', () => {
    const runtime = createFightRuntime();
    const state = runtime.getState();
    if (!state) throw new Error('Missing fight state fixture');
    const profile = resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 2 });
    const event = resolveFightStageEvent(0, profile);
    const calm = resolveFightStageReaction(state, event);

    state.player1.health = state.player1.stats.maxHealth * 0.18;
    state.combos[0].count = 7;
    state.combos[0].isActive = true;
    state.hitFreezeFrames = 4;
    state.player2.hitstunFrames = 12;
    const excited = resolveFightStageReaction(state, event);

    expect(excited.crowdEnergy).toBeGreaterThan(calm.crowdEnergy);
    expect(excited.lightPulse).toBeGreaterThan(calm.lightPulse);
    expect(excited.impactPulse).toBeGreaterThan(0);
    expect(excited.healthPressure).toBeGreaterThan(0.75);
    expect(excited.comboEnergy).toBeGreaterThan(0.8);
  });

  it('cycles every stage event through warning, active, and release phases deterministically', () => {
    for (const profile of [
      resolveFightGraphicsProfile({ theme: 'neon_arena' }),
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 0 }),
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 1 }),
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 2 }),
    ]) {
      const phases = new Set<string>();
      for (let frame = 0; frame < profile.stageEventPeriod; frame += 1) {
        const event = resolveFightStageEvent(frame, profile);
        phases.add(event.phase);
        expect(event.intensity).toBeGreaterThanOrEqual(0);
        expect(event.intensity).toBeLessThanOrEqual(1);
        expect(event.phaseProgress).toBeGreaterThanOrEqual(0);
        expect(event.phaseProgress).toBeLessThanOrEqual(1);
      }
      expect(phases).toEqual(new Set(['idle', 'warning', 'active', 'release']));
    }
  });

  it('resolves distinct Babylon profiles and clamps out-of-range encounters', () => {
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 0 }).id).toBe(
      'babylon_market'
    );
    expect(
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 0 }).foregroundMotif
    ).toBe('market_awning');
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 0 }).stageEventId).toBe(
      'market_caravan'
    );
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 1 }).id).toBe(
      'babylon_archive'
    );
    expect(
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 1 }).foregroundMotif
    ).toBe('archive_columns');
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 1 }).stageEventId).toBe(
      'archive_scan'
    );
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 99 }).id).toBe(
      'babylon_gate'
    );
    expect(
      resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 99 }).foregroundMotif
    ).toBe('gate_braziers');
    expect(resolveFightGraphicsProfile({ theme: 'babylon', encounterIndex: 99 }).stageEventId).toBe(
      'gate_heat_wave'
    );
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
