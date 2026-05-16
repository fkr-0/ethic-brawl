/**
 * Social arousal model for moving story-mode environments.
 *
 * This module is pure data/logic: it does not spawn entities directly. Runtime
 * systems can call evaluateSocialEnvironment after each beat/wave/action and
 * translate the resulting events into speech bubbles, hazards, allies, drops,
 * ambushes, boss modifiers, or infinite unrest waves.
 */

import type { CharacterId } from '@/content/characters/character-data';

export type CrowdIdeologyId =
  | 'quietist'
  | 'insurgent'
  | 'fascist'
  | 'council_communist'
  | 'bolshevist'
  | 'liberal_civic'
  | 'boss_loyalist';

export type SocialEventId =
  | 'window_speech_bubbles_against_player'
  | 'window_speech_bubbles_against_boss'
  | 'throw_stones_at_player'
  | 'throw_molotovs_at_player'
  | 'small_group_ambush_player'
  | 'trap_enemy_path'
  | 'allied_citizens_join'
  | 'items_dropped_from_windows'
  | 'infinite_unrest_wave'
  | 'boss_arrives_empowered'
  | 'boss_arrives_weakened';

export type SocialActionId =
  | 'protect_citizen'
  | 'hurt_citizen'
  | 'destroy_security_drone'
  | 'destroy_public_shelter'
  | 'spare_enemy'
  | 'execute_enemy'
  | 'loot_shop'
  | 'share_items'
  | 'deface_boss_symbol'
  | 'collateral_fire';

export interface SocialIdeologyAxes {
  /** -100 reactionary/private-order, +100 communist/common-ownership. */
  collectivism: number;
  /** -100 anti-authoritarian, +100 authoritarian/state-command. */
  authority: number;
  /** 0 international/local-pluralist, 100 nationalist/ethnic-majoritarian. */
  nationalism: number;
  /** 0 passive grievance, 100 immediate insurrectionary direct action. */
  insurgency: number;
}

export interface SocialArousalState {
  /** Demand for uprising against the stage boss, 0..100. */
  antiBoss: number;
  /** Hostility toward the player, 0..100. */
  antiPlayer: number;
  /** How quickly a crowd converts opinion into street action, 0..100. */
  volatility: number;
  ideology: SocialIdeologyAxes;
}

export interface SocialActionEffect {
  action: SocialActionId;
  antiBossDelta: number;
  antiPlayerDelta: number;
  volatilityDelta: number;
  ideologyShift?: Partial<SocialIdeologyAxes>;
}

export interface CharacterSocialAffinity {
  character: CharacterId;
  /** Base crowd trust before stage/action modifiers, -100..100. */
  acceptance: number;
  /** Multiplies social action changes; >1 means the crowd reads actions as symbolic. */
  actionMultiplier: number;
  notes: string;
}

export interface SocialSupportProfile {
  ideology: CrowdIdeologyId;
  acceptance: number;
  antiBoss: number;
  antiPlayer: number;
  actionMultiplier: number;
  playerSupport: number;
  bossPressure: number;
}

export interface MovingEnvironmentEvent {
  id: SocialEventId;
  target: 'player' | 'enemy' | 'both' | 'stage';
  intensity: number;
  cadenceSeconds: number;
  speechBubblePool?: readonly string[];
  description: string;
}

export interface BossSocialModifier {
  appearanceVariant:
    | 'isolated_tyrant'
    | 'guarded_commander'
    | 'beloved_strongman'
    | 'besieged_overseer';
  difficultyMultiplier: number;
  extraGuardWaves: number;
  citizenInterference: 'none' | 'against_player' | 'against_boss' | 'chaotic_both';
}

export interface SocialEvaluation {
  profile: SocialSupportProfile;
  events: MovingEnvironmentEvent[];
  bossModifier: BossSocialModifier;
  requiresMoreUnrestBeforeBoss: boolean;
}

export interface StageSocialDynamics {
  baseline: SocialArousalState;
  bossGate: {
    minimumAntiBoss: number;
    maximumAntiPlayer: number;
    infiniteWaveEnemyIds: readonly string[];
    note: string;
  };
  characterAffinities: readonly CharacterSocialAffinity[];
  actionEffects: readonly SocialActionEffect[];
  speech: {
    antiPlayer: readonly string[];
    antiBoss: readonly string[];
    chaotic: readonly string[];
  };
  designNotes: readonly string[];
}

const DEFAULT_CHARACTER_AFFINITY: CharacterSocialAffinity = {
  character: 'camus',
  acceptance: 0,
  actionMultiplier: 1,
  notes: 'Fallback neutral read when a stage has no explicit affinity entry.',
};

export function clampSocialValue(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function clampAxisValue(value: number, min = -100, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function classifyUprising(ideology: SocialIdeologyAxes): CrowdIdeologyId {
  if (ideology.insurgency < 25) {
    return ideology.authority > 50 && ideology.nationalism > 45 ? 'boss_loyalist' : 'quietist';
  }

  if (ideology.nationalism >= 65 && ideology.authority >= 35 && ideology.collectivism <= 20) {
    return 'fascist';
  }

  if (ideology.collectivism >= 45 && ideology.authority <= -25) {
    return 'council_communist';
  }

  if (ideology.collectivism >= 45 && ideology.authority >= 25) {
    return 'bolshevist';
  }

  if (ideology.authority <= -35 && ideology.insurgency >= 55) {
    return 'insurgent';
  }

  return 'liberal_civic';
}

export function getCharacterAffinity(
  dynamics: StageSocialDynamics,
  character: CharacterId
): CharacterSocialAffinity {
  return (
    dynamics.characterAffinities.find((affinity) => affinity.character === character) ?? {
      ...DEFAULT_CHARACTER_AFFINITY,
      character,
    }
  );
}

export function createSocialState(dynamics: StageSocialDynamics): SocialArousalState {
  return {
    ...dynamics.baseline,
    ideology: { ...dynamics.baseline.ideology },
  };
}

export function applySocialAction(
  state: SocialArousalState,
  action: SocialActionEffect,
  multiplier = 1
): SocialArousalState {
  return {
    antiBoss: clampSocialValue(state.antiBoss + action.antiBossDelta * multiplier),
    antiPlayer: clampSocialValue(state.antiPlayer + action.antiPlayerDelta * multiplier),
    volatility: clampSocialValue(state.volatility + action.volatilityDelta * multiplier),
    ideology: {
      collectivism: clampAxisValue(
        state.ideology.collectivism + (action.ideologyShift?.collectivism ?? 0) * multiplier
      ),
      authority: clampAxisValue(
        state.ideology.authority + (action.ideologyShift?.authority ?? 0) * multiplier
      ),
      nationalism: clampAxisValue(
        state.ideology.nationalism + (action.ideologyShift?.nationalism ?? 0) * multiplier,
        0,
        100
      ),
      insurgency: clampAxisValue(
        state.ideology.insurgency + (action.ideologyShift?.insurgency ?? 0) * multiplier,
        0,
        100
      ),
    },
  };
}

export function getSocialActionEffect(
  dynamics: StageSocialDynamics,
  action: SocialActionId
): SocialActionEffect | undefined {
  return dynamics.actionEffects.find((effect) => effect.action === action);
}

export function getSocialSupportProfile(
  dynamics: StageSocialDynamics,
  character: CharacterId,
  state: SocialArousalState
): SocialSupportProfile {
  const affinity = getCharacterAffinity(dynamics, character);
  const acceptance = clampAxisValue(
    affinity.acceptance + state.antiBoss * 0.35 - state.antiPlayer * 0.6
  );
  const ideology = classifyUprising(state.ideology);
  const actionMultiplier = Math.max(
    0.25,
    Number((affinity.actionMultiplier * ideologyActionMultiplier(ideology)).toFixed(2))
  );

  return {
    ideology,
    acceptance,
    antiBoss: state.antiBoss,
    antiPlayer: state.antiPlayer,
    actionMultiplier,
    playerSupport: clampSocialValue(50 + acceptance * 0.5 - state.antiPlayer * 0.25),
    bossPressure: clampSocialValue(state.antiBoss + state.volatility * 0.25),
  };
}

export function evaluateSocialEnvironment(
  dynamics: StageSocialDynamics,
  character: CharacterId,
  state: SocialArousalState
): SocialEvaluation {
  const profile = getSocialSupportProfile(dynamics, character, state);
  const events: MovingEnvironmentEvent[] = [];

  if (state.antiPlayer >= 30) {
    events.push({
      id: 'window_speech_bubbles_against_player',
      target: 'player',
      intensity: state.antiPlayer,
      cadenceSeconds: state.antiPlayer >= 70 ? 4 : 8,
      speechBubblePool: dynamics.speech.antiPlayer,
      description: 'Residents lean from windows and insult the player with visible speech bubbles.',
    });
  }

  if (state.antiBoss >= 30) {
    events.push({
      id: 'window_speech_bubbles_against_boss',
      target: 'enemy',
      intensity: state.antiBoss,
      cadenceSeconds: state.antiBoss >= 70 ? 4 : 9,
      speechBubblePool: dynamics.speech.antiBoss,
      description: 'Residents heckle the stage boss and broadcast uprising demand from windows.',
    });
  }

  if (state.antiPlayer >= 45) {
    events.push({
      id: 'throw_stones_at_player',
      target: 'player',
      intensity: state.antiPlayer,
      cadenceSeconds: state.antiPlayer >= 80 ? 5 : 10,
      description: 'Window citizens throw stones as low-damage stagger projectiles.',
    });
  }

  if (state.antiPlayer >= 70 && state.volatility >= 50) {
    events.push({
      id: 'throw_molotovs_at_player',
      target: 'player',
      intensity: Math.max(state.antiPlayer, state.volatility),
      cadenceSeconds: 14,
      description: 'Radicalized windows throw molotov cocktails that leave temporary fire lanes.',
    });
  }

  if (state.antiPlayer >= 60 && profile.acceptance < -15) {
    events.push({
      id: 'small_group_ambush_player',
      target: 'player',
      intensity: state.antiPlayer,
      cadenceSeconds: 20,
      description: 'Small citizen groups emerge from alleys or stairwells to ambush the player.',
    });
  }

  if (profile.playerSupport >= 55 && state.antiBoss >= 45) {
    events.push({
      id: 'trap_enemy_path',
      target: 'enemy',
      intensity: profile.bossPressure,
      cadenceSeconds: 18,
      description: 'Citizens rig traps under enemy routes: dropped cables, oil slicks, barricades.',
    });
  }

  if (profile.playerSupport >= 65 && state.antiBoss >= 60) {
    events.push({
      id: 'allied_citizens_join',
      target: 'enemy',
      intensity: profile.playerSupport,
      cadenceSeconds: 28,
      description: 'Allied citizens briefly enter as fragile helpers and crowd-control enemies.',
    });
  }

  if (profile.playerSupport >= 70) {
    events.push({
      id: 'items_dropped_from_windows',
      target: 'stage',
      intensity: profile.playerSupport,
      cadenceSeconds: 24,
      description: 'Supportive windows drop potions, books, or temporary boosts in safe arcs.',
    });
  }

  if (requiresMoreUnrestBeforeBoss(dynamics, state)) {
    events.push({
      id: 'infinite_unrest_wave',
      target: 'both',
      intensity: Math.max(state.antiBoss, state.antiPlayer, state.volatility),
      cadenceSeconds: 16,
      speechBubblePool: dynamics.speech.chaotic,
      description:
        'The level loops unrest waves until the uprising demand is high enough and player rejection is low enough for the boss confrontation.',
    });
  }

  const bossModifier = getBossSocialModifier(dynamics, profile, state);
  events.push({
    id: bossModifier.difficultyMultiplier >= 1 ? 'boss_arrives_empowered' : 'boss_arrives_weakened',
    target: 'stage',
    intensity: Math.round(bossModifier.difficultyMultiplier * 50),
    cadenceSeconds: 0,
    description: `Boss appearance variant: ${bossModifier.appearanceVariant}.`,
  });

  return {
    profile,
    events,
    bossModifier,
    requiresMoreUnrestBeforeBoss: requiresMoreUnrestBeforeBoss(dynamics, state),
  };
}

export function requiresMoreUnrestBeforeBoss(
  dynamics: StageSocialDynamics,
  state: SocialArousalState
): boolean {
  return (
    state.antiBoss < dynamics.bossGate.minimumAntiBoss ||
    state.antiPlayer > dynamics.bossGate.maximumAntiPlayer
  );
}

export function getBossSocialModifier(
  dynamics: StageSocialDynamics,
  profile: SocialSupportProfile,
  state: SocialArousalState
): BossSocialModifier {
  if (state.antiPlayer >= 70 || profile.ideology === 'boss_loyalist') {
    return {
      appearanceVariant: 'beloved_strongman',
      difficultyMultiplier: 1.25,
      extraGuardWaves: 2,
      citizenInterference: 'against_player',
    };
  }

  if (requiresMoreUnrestBeforeBoss(dynamics, state)) {
    return {
      appearanceVariant: 'guarded_commander',
      difficultyMultiplier: 1.1,
      extraGuardWaves: 1,
      citizenInterference: 'chaotic_both',
    };
  }

  if (profile.bossPressure >= 75 && profile.playerSupport >= 60) {
    return {
      appearanceVariant: 'besieged_overseer',
      difficultyMultiplier: 0.85,
      extraGuardWaves: 0,
      citizenInterference: 'against_boss',
    };
  }

  return {
    appearanceVariant: 'isolated_tyrant',
    difficultyMultiplier: 1,
    extraGuardWaves: 0,
    citizenInterference: 'none',
  };
}

function ideologyActionMultiplier(ideology: CrowdIdeologyId): number {
  const multipliers: Record<CrowdIdeologyId, number> = {
    quietist: 0.65,
    insurgent: 1.35,
    fascist: 1.2,
    council_communist: 1.25,
    bolshevist: 1.15,
    liberal_civic: 0.9,
    boss_loyalist: 1.1,
  };
  return multipliers[ideology];
}
