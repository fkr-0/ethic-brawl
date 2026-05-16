import { getStoryStage } from '@/content/stages';
import {
  type SocialArousalState,
  applySocialAction,
  classifyUprising,
  createSocialState,
  evaluateSocialEnvironment,
  getSocialActionEffect,
  getSocialSupportProfile,
  requiresMoreUnrestBeforeBoss,
} from '@/game/social';
import { describe, expect, it } from 'vitest';

function state(overrides: Partial<SocialArousalState>): SocialArousalState {
  const { ideology, ...rest } = overrides;
  return {
    antiBoss: 50,
    antiPlayer: 20,
    volatility: 50,
    ...rest,
    ideology: {
      collectivism: 0,
      authority: 0,
      nationalism: 0,
      insurgency: 50,
      ...ideology,
    },
  };
}

describe('social arousal ideology axes', () => {
  it('classifies requested uprising colors on clean axes', () => {
    expect(
      classifyUprising({ collectivism: 0, authority: -70, nationalism: 5, insurgency: 80 })
    ).toBe('insurgent');
    expect(
      classifyUprising({ collectivism: -35, authority: 60, nationalism: 85, insurgency: 60 })
    ).toBe('fascist');
    expect(
      classifyUprising({ collectivism: 70, authority: -50, nationalism: 10, insurgency: 55 })
    ).toBe('council_communist');
    expect(
      classifyUprising({ collectivism: 70, authority: 60, nationalism: 15, insurgency: 55 })
    ).toBe('bolshevist');
  });

  it('multiplies action effects by character and ideology fit', () => {
    const sprawl = getStoryStage('sprawl').socialDynamics;
    const profile = getSocialSupportProfile(sprawl, 'camus', createSocialState(sprawl));
    const effect = getSocialActionEffect(sprawl, 'protect_citizen');

    expect(profile.ideology).toBe('insurgent');
    expect(profile.actionMultiplier).toBeGreaterThan(1.5);
    expect(effect).toBeDefined();
    if (!effect) {
      throw new Error('Missing social action effect fixture');
    }

    const next = applySocialAction(createSocialState(sprawl), effect, profile.actionMultiplier);
    expect(next.antiPlayer).toBeLessThan(sprawl.baseline.antiPlayer);
    expect(next.antiBoss).toBeGreaterThan(sprawl.baseline.antiBoss);
  });
});

describe('moving social environment outcomes', () => {
  it('emits hostile window comments, stones, molotovs, and ambushes when player is hated', () => {
    const dynamics = getStoryStage('arcology_entrance').socialDynamics;
    const hostile = state({
      antiBoss: 28,
      antiPlayer: 82,
      volatility: 76,
      ideology: { collectivism: -35, authority: 62, nationalism: 82, insurgency: 70 },
    });

    const evaluation = evaluateSocialEnvironment(dynamics, 'diogenes', hostile);
    const eventIds = evaluation.events.map((event) => event.id);

    expect(evaluation.profile.ideology).toBe('fascist');
    expect(eventIds).toEqual(
      expect.arrayContaining([
        'window_speech_bubbles_against_player',
        'throw_stones_at_player',
        'throw_molotovs_at_player',
        'small_group_ambush_player',
        'infinite_unrest_wave',
        'boss_arrives_empowered',
      ])
    );
    expect(evaluation.bossModifier.appearanceVariant).toBe('beloved_strongman');
  });

  it('emits traps, allied citizens, and item drops when anti-boss arousal accepts the player', () => {
    const dynamics = getStoryStage('sprawl').socialDynamics;
    const supportive = state({
      antiBoss: 84,
      antiPlayer: 8,
      volatility: 58,
      ideology: { collectivism: 55, authority: -55, nationalism: 6, insurgency: 80 },
    });

    const evaluation = evaluateSocialEnvironment(dynamics, 'camus', supportive);
    const eventIds = evaluation.events.map((event) => event.id);

    expect(evaluation.profile.playerSupport).toBeGreaterThanOrEqual(70);
    expect(eventIds).toEqual(
      expect.arrayContaining([
        'window_speech_bubbles_against_boss',
        'trap_enemy_path',
        'allied_citizens_join',
        'items_dropped_from_windows',
        'boss_arrives_weakened',
      ])
    );
    expect(evaluation.bossModifier.appearanceVariant).toBe('besieged_overseer');
  });

  it('keeps stages infinite until boss-gate arousal conditions are matched', () => {
    const dynamics = getStoryStage('arcology_labs').socialDynamics;
    const lowDemand = createSocialState(dynamics);
    const sufficientDemand = state({
      antiBoss: dynamics.bossGate.minimumAntiBoss + 5,
      antiPlayer: dynamics.bossGate.maximumAntiPlayer - 20,
      volatility: 60,
      ideology: { collectivism: 65, authority: -40, nationalism: 8, insurgency: 75 },
    });

    expect(requiresMoreUnrestBeforeBoss(dynamics, lowDemand)).toBe(true);
    expect(requiresMoreUnrestBeforeBoss(dynamics, sufficientDemand)).toBe(false);
    expect(
      evaluateSocialEnvironment(dynamics, 'leibniz', lowDemand).events.map((event) => event.id)
    ).toContain('infinite_unrest_wave');
  });

  it('models character-stage acceptance differences', () => {
    const sprawl = getStoryStage('sprawl').socialDynamics;
    const sprawlState = createSocialState(sprawl);

    const camus = getSocialSupportProfile(sprawl, 'camus', sprawlState);
    const machiavelli = getSocialSupportProfile(sprawl, 'machiavelli', sprawlState);

    expect(camus.acceptance).toBeGreaterThan(machiavelli.acceptance);
    expect(camus.playerSupport).toBeGreaterThan(machiavelli.playerSupport);
  });
});
