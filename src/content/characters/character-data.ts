/**
 * Character definitions for Ethic Brawl
 */

import type { AttackPresentationPresetId } from '@/game/fight/attack-presentation-presets';
import type { AttackData, AttackType, FighterStats } from '@/game/fight/fighter-state';
import { DEFAULT_ATTACK_CHAIN } from '@/game/fight/fighter-state';
import type { AttackHitPolicyPresetId } from '@/game/fight/hit-policy-presets';
import type { AttackMoveClassPresetId } from '@/game/fight/move-class-presets';
import { buildCharacterAbilities, buildCharacterStats } from './character-loader';

/**
 * Character ID type
 */
export type CharacterId =
  | 'camus'
  | 'leibniz'
  | 'machiavelli'
  | 'diogenes'
  | 'aristotle'
  | 'aquinas'
  | 'anselm'
  | 'hegel'
  | 'nietzsche'
  | 'foucault'
  | 'deleuze_guattari'
  | 'marx'
  | 'bakunin'
  | 'schmitt'
  | 'socrates'
  | 'kant'
  | 'kierkegaard'
  | 'stirner';

/**
 * Special attack types
 */
export type SpecialType = 'projectile' | 'aoe' | 'counter' | 'buff';

/**
 * Character special attack
 */
export interface CharacterSpecial {
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  range: number;
  type: SpecialType;
  hitPolicyPreset?: AttackHitPolicyPresetId;
  moveClassPreset?: AttackMoveClassPresetId;
  presentationPreset?: AttackPresentationPresetId;
}

/**
 * Character gimmick (passive ability)
 */
export interface CharacterGimmick {
  name: string;
  description: string;
  trigger: 'on_health_loss' | 'on_attack' | 'on_block' | 'on_hit';
  effect: {
    type: string;
    value: number;
    per?: number;
  };
}

/**
 * Character movement profile
 */
export interface CharacterMovementProfile {
  walkMultiplier: number;
  runMultiplier: number;
  accelerationMultiplier: number;
  decelerationMultiplier: number;
  jumpMultiplier: number;
  airControlMultiplier: number;
  weight: number;
}

export const DEFAULT_MOVEMENT_PROFILE: CharacterMovementProfile = {
  walkMultiplier: 1,
  runMultiplier: 1,
  accelerationMultiplier: 1,
  decelerationMultiplier: 1,
  jumpMultiplier: 1,
  airControlMultiplier: 1,
  weight: 1,
};

/**
 * Character combat profile
 */
export interface CharacterCombatProfile {
  normalChain?: AttackData[];
  normalHitPolicyPresets?: Partial<Record<Exclude<AttackType, 'special'>, AttackHitPolicyPresetId>>;
  normalMoveClassPresets?: Partial<Record<Exclude<AttackType, 'special'>, AttackMoveClassPresetId>>;
}

export type CharacterAmbientVfxPresetId =
  | 'absurd_motes'
  | 'monad_orbit'
  | 'scheme_smoke'
  | 'lantern_flicker';

export interface CharacterAnimationProfile {
  silhouetteWidth: number;
  silhouetteHeight: number;
  headScaleX: number;
  headScaleY: number;
  armReach: number;
  legStride: number;
  idleSway: number;
  idleBreath: number;
  anticipation: number;
  recoverySpring: number;
  turnaroundEmphasis: number;
  recoilEmphasis: number;
  airborneFloat: number;
  visualSeed: number;
  ambientPreset: CharacterAmbientVfxPresetId;
}

export const DEFAULT_ANIMATION_PROFILE: CharacterAnimationProfile = {
  silhouetteWidth: 1,
  silhouetteHeight: 1,
  headScaleX: 1,
  headScaleY: 1,
  armReach: 1,
  legStride: 1,
  idleSway: 1,
  idleBreath: 1,
  anticipation: 1,
  recoverySpring: 1,
  turnaroundEmphasis: 1,
  recoilEmphasis: 1,
  airborneFloat: 1,
  visualSeed: 0,
  ambientPreset: 'absurd_motes',
};

function createAuthoredAttack(
  chainIndex: number,
  overrides: Partial<AttackData> & Pick<AttackData, 'id' | 'name'>
): AttackData {
  const base = DEFAULT_ATTACK_CHAIN[chainIndex];
  if (!base) {
    throw new Error(`missing default attack at index ${chainIndex}`);
  }

  return {
    ...base,
    ...overrides,
  };
}

const CAMUS_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'camus_absurd_jab',
    name: 'Absurd Jab',
    damage: 9,
    startup: 5,
    active: 4,
    recovery: 11,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'camus_rebel_backfist',
    name: 'Rebel Backfist',
    damage: 11,
    hitstun: 15,
    range: 68,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'camus_sisyphus_heel',
    name: 'Sisyphus Heel',
    damage: 16,
    hitstun: 21,
    knockbackX: 6,
    knockbackY: 2,
    range: 58,
    startup: 9,
    active: 6,
    recovery: 18,
    presentationPreset: 'heel_drop',
  }),
];

const LEIBNIZ_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'leibniz_monad_jab',
    name: 'Monad Jab',
    damage: 8,
    startup: 5,
    recovery: 11,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'leibniz_calculus_palm',
    name: 'Calculus Palm',
    damage: 10,
    hitstun: 15,
    range: 72,
    hitPolicyPreset: 'double_tap',
    presentationPreset: 'monad_sweep',
  }),
  createAuthoredAttack(2, {
    id: 'leibniz_possible_arc',
    name: 'Possible Worlds Arc',
    damage: 14,
    hitstun: 19,
    knockbackX: 5,
    knockbackY: 1,
    presentationPreset: 'rebel_wave',
  }),
];

const MACHIAVELLI_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'machiavelli_court_feint',
    name: 'Court Feint',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'machiavelli_princes_edict',
    name: "Prince's Edict",
    damage: 11,
    hitstun: 15,
    hitPolicyPreset: 'double_tap',
    moveClassPreset: 'launcher',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'machiavelli_palace_coup',
    name: 'Palace Coup',
    damage: 17,
    hitstun: 22,
    knockbackX: 7,
    knockbackY: 3,
    startup: 8,
    active: 6,
    recovery: 19,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const DIOGENES_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'diogenes_barrel_flick',
    name: 'Barrel Flick',
    damage: 8,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'diogenes_lantern_swipe',
    name: 'Lantern Swipe',
    damage: 10,
    range: 70,
    presentationPreset: 'cynic_flurry',
  }),
  createAuthoredAttack(2, {
    id: 'diogenes_dogs_kick',
    name: "Dog's Kick",
    damage: 14,
    hitstun: 19,
    knockbackX: 5,
    startup: 8,
    presentationPreset: 'heel_drop',
  }),
];

const FOUCAULT_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'foucault_disciplinary_tap',
    name: 'Disciplinary Tap',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'foucault_archive_hook',
    name: 'Archive Hook',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'foucault_clinic_sweep',
    name: 'Clinic Sweep',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const DELEUZE_GUATTARI_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'deleuze_guattari_concept_jab',
    name: 'Concept Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'deleuze_guattari_assemblage_sweep',
    name: 'Assemblage Sweep',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'deleuze_guattari_plateau_kick',
    name: 'Plateau Kick',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const MARX_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'marx_manifesto_jab',
    name: 'Manifesto Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'marx_dialectic_hook',
    name: 'Dialectic Hook',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'marx_factory_stomp',
    name: 'Factory Stomp',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const BAKUNIN_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'bakunin_riot_jab',
    name: 'Riot Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'bakunin_authority_breaker',
    name: 'Authority Breaker',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'bakunin_black_flag_kick',
    name: 'Black-Flag Kick',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const SCHMITT_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'schmitt_decision_jab',
    name: 'Decision Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'schmitt_jurist_crush',
    name: 'Jurist Crush',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'schmitt_border_kick',
    name: 'Border Kick',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const SOCRATES_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'socrates_gadfly_jab',
    name: 'Gadfly Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'socrates_elenchus_palm',
    name: 'Elenchus Palm',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'socrates_agora_trip',
    name: 'Agora Trip',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const KANT_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'kant_maxim_jab',
    name: 'Maxim Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'kant_duty_palm',
    name: 'Duty Palm',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'kant_sublime_kick',
    name: 'Sublime Kick',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const KIERKEGAARD_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'kierkegaard_irony_jab',
    name: 'Irony Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'kierkegaard_anxiety_cut',
    name: 'Anxiety Cut',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'kierkegaard_faith_heel',
    name: 'Faith Heel',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const STIRNER_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'stirner_unique_jab',
    name: 'Unique Jab',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'stirner_spook_slap',
    name: 'Spook Slap',
    damage: 12,
    startup: 7,
    recovery: 15,
    hitstun: 16,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'stirner_ownness_kick',
    name: 'Ownness Kick',
    damage: 17,
    startup: 9,
    recovery: 19,
    hitstun: 22,
    knockbackX: 6,
    knockbackY: 3,
    range: 68,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const ARISTOTLE_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'aristotle_golden_mean_jab',
    name: 'Golden Mean Jab',
    damage: 9,
    startup: 6,
    active: 4,
    recovery: 11,
    range: 66,
    hitPolicyPreset: 'double_tap',
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'aristotle_syllogism_lance',
    name: 'Syllogism Lance',
    damage: 12,
    hitstun: 16,
    range: 78,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'aristotle_prime_mover_drop',
    name: 'Prime Mover Drop',
    damage: 17,
    hitstun: 22,
    knockbackX: 5,
    knockbackY: 4,
    range: 62,
    startup: 9,
    active: 6,
    recovery: 19,
    moveClassPreset: 'launcher',
    presentationPreset: 'heel_drop',
  }),
];

const AQUINAS_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'aquinas_summa_strike',
    name: 'Summa Strike',
    damage: 10,
    startup: 7,
    active: 4,
    recovery: 13,
    range: 62,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'aquinas_scholastic_hammer',
    name: 'Scholastic Hammer',
    damage: 13,
    hitstun: 17,
    range: 68,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'aquinas_cathedral_charge',
    name: 'Cathedral Charge',
    damage: 18,
    hitstun: 23,
    knockbackX: 8,
    knockbackY: 2,
    range: 72,
    startup: 10,
    active: 7,
    recovery: 21,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const ANSELM_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'anselm_proslogion_pierce',
    name: 'Proslogion Pierce',
    damage: 8,
    startup: 5,
    recovery: 10,
    range: 66,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'anselm_ontological_ray',
    name: 'Ontological Ray',
    damage: 11,
    hitstun: 16,
    range: 76,
    hitPolicyPreset: 'double_tap',
    presentationPreset: 'monad_sweep',
  }),
  createAuthoredAttack(2, {
    id: 'anselm_credo_dive',
    name: 'Credo Dive',
    damage: 15,
    hitstun: 20,
    knockbackX: 5,
    knockbackY: 3,
    startup: 8,
    active: 6,
    recovery: 17,
    moveClassPreset: 'cross_lane_arc',
    presentationPreset: 'heel_drop',
  }),
];

const HEGEL_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'hegel_thesis_tap',
    name: 'Thesis Tap',
    damage: 8,
    startup: 5,
    recovery: 10,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'hegel_antithesis_break',
    name: 'Antithesis Break',
    damage: 12,
    hitstun: 17,
    range: 70,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'hegel_synthesis_crown',
    name: 'Synthesis Crown',
    damage: 17,
    hitstun: 23,
    knockbackX: 6,
    knockbackY: 4,
    startup: 9,
    active: 6,
    recovery: 19,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

const NIETZSCHE_NORMAL_CHAIN: AttackData[] = [
  createAuthoredAttack(0, {
    id: 'nietzsche_hammer_aphorism',
    name: 'Hammer Aphorism',
    damage: 10,
    startup: 6,
    active: 4,
    recovery: 12,
    presentationPreset: 'jab_snap',
  }),
  createAuthoredAttack(1, {
    id: 'nietzsche_eternal_return_counter',
    name: 'Eternal Return Counter',
    damage: 13,
    hitstun: 18,
    range: 68,
    moveClassPreset: 'pressure_string',
    presentationPreset: 'rebel_wave',
  }),
  createAuthoredAttack(2, {
    id: 'nietzsche_overman_rush',
    name: 'Overman Rush',
    damage: 19,
    hitstun: 22,
    knockbackX: 8,
    knockbackY: 3,
    startup: 8,
    active: 7,
    recovery: 21,
    moveClassPreset: 'launcher',
    presentationPreset: 'launcher_crack',
  }),
];

/**
 * Character quotes
 */
export interface CharacterQuotes {
  intro: string[];
  victory: string[];
  defeat: string[];
  special: string[];
}

/**
 * Character color scheme
 */
export interface CharacterColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Full character definition
 */
export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  subtitle: string;
  baseStats: FighterStats;
  special: CharacterSpecial;
  movement: CharacterMovementProfile;
  combat?: CharacterCombatProfile;
  gimmick: CharacterGimmick;
  quotes: CharacterQuotes;
  colors: CharacterColors;
  animation: CharacterAnimationProfile;
  abilities?: string[];
}

/**
 * All character definitions
 */
export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  camus: {
    id: 'camus',
    name: 'Albert Camus',
    subtitle: 'The Absurdist',
    baseStats: buildCharacterStats('camus', 100),
    abilities: buildCharacterAbilities('camus'),
    special: {
      name: 'Absurd Revolt',
      description: 'Unleash the meaningless fury of existence in all directions',
      damage: 25,
      cooldown: 300,
      range: 100,
      type: 'aoe',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      accelerationMultiplier: 1.05,
      decelerationMultiplier: 1.05,
      airControlMultiplier: 1.05,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 0.97,
      silhouetteHeight: 1.04,
      headScaleY: 1.05,
      armReach: 1.02,
      idleSway: 1.12,
      idleBreath: 1.08,
      anticipation: 1.08,
      recoverySpring: 0.95,
      turnaroundEmphasis: 1.05,
      recoilEmphasis: 0.92,
      airborneFloat: 1.05,
      visualSeed: 0.35,
      ambientPreset: 'absurd_motes',
    },
    combat: {
      normalChain: CAMUS_NORMAL_CHAIN,
      normalMoveClassPresets: {
        medium: 'pressure_string',
      },
    },
    gimmick: {
      name: "Rebel's Resilience",
      description: 'Grows stronger as hope fades',
      trigger: 'on_health_loss',
      effect: {
        type: 'damage_bonus',
        value: 0.02,
        per: 0.1,
      },
    },
    quotes: {
      intro: [
        'I rebel, therefore we exist.',
        'The absurd is the essential concept.',
        'One must imagine Sisyphus happy... and furious.',
      ],
      victory: [
        'The struggle itself is enough.',
        'In the midst of winter, I found an invincible summer.',
        'Your defeat was always meaningless. Sorry.',
      ],
      defeat: ['Perhaps this too is absurd...', 'At least I imagined myself happy.'],
      special: ['ABSURD REVOLT!', 'EMBRACE THE VOID!'],
    },
    colors: {
      primary: '#00F5FF',
      secondary: '#FF00FF',
      accent: '#39FF14',
    },
  },

  leibniz: {
    id: 'leibniz',
    name: 'Gottfried Leibniz',
    subtitle: 'The Optimist',
    baseStats: buildCharacterStats('leibniz', 90),
    abilities: buildCharacterAbilities('leibniz'),
    special: {
      name: 'Monadic Strike',
      description: 'Project a simple substance that seeks all possible worlds',
      damage: 20,
      cooldown: 240,
      range: 200,
      type: 'projectile',
      hitPolicyPreset: 'double_tap',
      moveClassPreset: 'cross_lane_arc',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      runMultiplier: 0.95,
      jumpMultiplier: 1.05,
      airControlMultiplier: 1.08,
      weight: 0.95,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 0.94,
      silhouetteHeight: 1.02,
      headScaleX: 1.04,
      headScaleY: 1.02,
      armReach: 1.1,
      legStride: 0.94,
      idleSway: 0.9,
      idleBreath: 1.2,
      anticipation: 0.96,
      recoverySpring: 1.1,
      turnaroundEmphasis: 0.92,
      recoilEmphasis: 0.88,
      airborneFloat: 1.12,
      visualSeed: 1.2,
      ambientPreset: 'monad_orbit',
    },
    combat: {
      normalChain: LEIBNIZ_NORMAL_CHAIN,
    },
    gimmick: {
      name: 'Best of All Worlds',
      description: 'Sometimes things just work out perfectly',
      trigger: 'on_attack',
      effect: {
        type: 'critical_chance',
        value: 0.1,
      },
    },
    quotes: {
      intro: [
        'This is the best of all possible worlds.',
        'Let us calculate.',
        'There are two labyrinths of the human mind.',
      ],
      victory: [
        'I told you it was the best outcome.',
        'Calculated. Precise. Inevitable.',
        'Everything is for the best in this best of all possible arenas.',
      ],
      defeat: ['Perhaps... this was also necessary.', 'My calculation was incomplete.'],
      special: ['MONADIC STRIKE!', 'SEEK THE OPTIMUM!'],
    },
    colors: {
      primary: '#39FF14',
      secondary: '#00F5FF',
      accent: '#FF00FF',
    },
  },

  machiavelli: {
    id: 'machiavelli',
    name: 'Niccolò Machiavelli',
    subtitle: 'The Strategist',
    baseStats: buildCharacterStats('machiavelli', 85),
    abilities: buildCharacterAbilities('machiavelli'),
    special: {
      name: 'Ends Justify',
      description: 'Enter a counter-stance that delivers devastating retribution',
      damage: 30,
      cooldown: 180,
      range: 80,
      type: 'counter',
      presentationPreset: 'counter_riposte',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.04,
      runMultiplier: 1.12,
      accelerationMultiplier: 1.2,
      decelerationMultiplier: 0.92,
      weight: 0.92,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.02,
      silhouetteHeight: 0.96,
      headScaleX: 0.96,
      armReach: 1.14,
      legStride: 1.08,
      idleSway: 0.84,
      idleBreath: 0.92,
      anticipation: 1.18,
      recoverySpring: 1.02,
      turnaroundEmphasis: 1.18,
      recoilEmphasis: 1.05,
      airborneFloat: 0.94,
      visualSeed: 2.1,
      ambientPreset: 'scheme_smoke',
    },
    combat: {
      normalChain: MACHIAVELLI_NORMAL_CHAIN,
      normalHitPolicyPresets: {
        medium: 'double_tap',
      },
      normalMoveClassPresets: {
        medium: 'launcher',
      },
    },
    gimmick: {
      name: 'Political Maneuver',
      description: 'Perfect positioning yields rewards',
      trigger: 'on_block',
      effect: {
        type: 'health_restore',
        value: 0.03,
      },
    },
    quotes: {
      intro: [
        'It is better to be feared than loved.',
        'The ends justify the means.',
        'Politics have no relation to morals.',
      ],
      victory: ['Men are so simple.', 'Fortune favors the bold.', 'You were useful. Briefly.'],
      defeat: ['Even the Prince can fall...', 'The conspiracy succeeded.'],
      special: ['THE ENDS JUSTIFY!', 'RETRIBUTION!'],
    },
    colors: {
      primary: '#FF00FF',
      secondary: '#FF073A',
      accent: '#00F5FF',
    },
  },

  diogenes: {
    id: 'diogenes',
    name: 'Diogenes of Sinope',
    subtitle: 'The Cynic',
    baseStats: buildCharacterStats('diogenes', 110),
    abilities: buildCharacterAbilities('diogenes'),
    special: {
      name: 'Lantern Flash',
      description: 'Reveal truth with blinding light, staggering all who witness',
      damage: 15,
      cooldown: 360,
      range: 150,
      type: 'aoe',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.92,
      runMultiplier: 0.88,
      accelerationMultiplier: 0.82,
      decelerationMultiplier: 1.1,
      jumpMultiplier: 0.94,
      airControlMultiplier: 0.85,
      weight: 1.15,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.08,
      silhouetteHeight: 0.92,
      headScaleX: 0.98,
      headScaleY: 0.95,
      armReach: 0.92,
      legStride: 0.88,
      idleSway: 0.72,
      idleBreath: 0.86,
      anticipation: 0.9,
      recoverySpring: 0.84,
      turnaroundEmphasis: 0.78,
      recoilEmphasis: 1.12,
      airborneFloat: 0.9,
      visualSeed: 3.4,
      ambientPreset: 'lantern_flicker',
    },
    combat: {
      normalChain: DIOGENES_NORMAL_CHAIN,
    },
    gimmick: {
      name: "Cynic's Disregard",
      description: 'True philosophers ignore trifling blows',
      trigger: 'on_hit',
      effect: {
        type: 'hitstun_resist',
        value: 0.2,
      },
    },
    quotes: {
      intro: [
        'I am looking for an honest opponent.',
        'Stand out of my sunlight.',
        'Dogs are my only true friends.',
      ],
      victory: [
        'You are a human. Disappointing.',
        'Still searching for that honest person.',
        'The lantern reveals all.',
      ],
      defeat: ['At least I died as I lived...', 'Even dogs have their day.'],
      special: ['BEHOLD THE LANTERN!', 'ILLUMINATION!'],
    },
    colors: {
      primary: '#FF073A',
      secondary: '#FFD700',
      accent: '#00F5FF',
    },
  },

  aristotle: {
    id: 'aristotle',
    name: 'Aristotle',
    subtitle: 'The Peripatetic',
    baseStats: buildCharacterStats('aristotle', 105),
    abilities: buildCharacterAbilities('aristotle'),
    special: {
      name: 'Virtue Balance Field',
      description:
        'Balance the field with golden-mean logic, stabilizing Aristotle and punishing overextension',
      damage: 18,
      cooldown: 260,
      range: 130,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.98,
      runMultiplier: 0.96,
      accelerationMultiplier: 0.94,
      decelerationMultiplier: 1.08,
      jumpMultiplier: 0.98,
      airControlMultiplier: 0.95,
      weight: 1.06,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.02,
      silhouetteHeight: 1.01,
      armReach: 1.12,
      legStride: 0.94,
      idleSway: 0.86,
      idleBreath: 0.98,
      anticipation: 0.95,
      recoverySpring: 0.92,
      turnaroundEmphasis: 0.9,
      recoilEmphasis: 0.88,
      airborneFloat: 0.92,
      visualSeed: 4.1,
      ambientPreset: 'absurd_motes',
    },
    combat: {
      normalChain: ARISTOTLE_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Golden Mean',
      description: 'Balanced timing rewards Aristotle with steadier recovery.',
      trigger: 'on_block',
      effect: { type: 'recovery_bonus', value: 0.08 },
    },
    quotes: {
      intro: ['Excellence is a habit.', 'Let us proceed from first principles.'],
      victory: ['The mean has prevailed.', 'A disciplined conclusion.'],
      defeat: ['An error in categorization...', 'The cause was misread.'],
      special: ['VIRTUE BALANCE!', 'PRIME MOVER!'],
    },
    colors: { primary: '#F0C04A', secondary: '#B8873A', accent: '#5F8FBF' },
  },

  aquinas: {
    id: 'aquinas',
    name: 'Thomas Aquinas',
    subtitle: 'The Angelic Doctor',
    baseStats: buildCharacterStats('aquinas', 115),
    abilities: buildCharacterAbilities('aquinas'),
    special: {
      name: 'Prime Cause Field',
      description: 'Consecrate the ground with a heavy protective domain.',
      damage: 16,
      cooldown: 280,
      range: 140,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.82,
      runMultiplier: 0.78,
      accelerationMultiplier: 0.72,
      decelerationMultiplier: 1.16,
      jumpMultiplier: 0.82,
      airControlMultiplier: 0.72,
      weight: 1.28,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.18,
      silhouetteHeight: 0.98,
      headScaleX: 1.03,
      armReach: 1.06,
      legStride: 0.82,
      idleSway: 0.62,
      idleBreath: 1.22,
      anticipation: 1.18,
      recoverySpring: 0.72,
      turnaroundEmphasis: 0.76,
      recoilEmphasis: 0.72,
      airborneFloat: 0.72,
      visualSeed: 5.2,
      ambientPreset: 'lantern_flicker',
    },
    combat: {
      normalChain: AQUINAS_NORMAL_CHAIN,
      normalMoveClassPresets: { heavy: 'launcher' },
    },
    gimmick: {
      name: 'Scholastic Fortitude',
      description: 'Broad defenses reduce the cost of taking blocked pressure.',
      trigger: 'on_block',
      effect: { type: 'damage_resist', value: 0.12 },
    },
    quotes: {
      intro: ['Reason serves the highest light.', 'I answer with the Five Ways.'],
      victory: ['The conclusion stands.', 'Grace and logic endure.'],
      defeat: ['A difficult objection...', 'I must revise the article.'],
      special: ['PRIME CAUSE!', 'FIVE WAYS!'],
    },
    colors: { primary: '#F3D36B', secondary: '#F1EFE4', accent: '#17171A' },
  },

  anselm: {
    id: 'anselm',
    name: 'Anselm of Canterbury',
    subtitle: 'The Ontological Proof',
    baseStats: buildCharacterStats('anselm', 92),
    abilities: buildCharacterAbilities('anselm'),
    special: {
      name: 'That-Than-Which Field',
      description: 'Seal the arena with an unavoidable proof field.',
      damage: 19,
      cooldown: 250,
      range: 150,
      type: 'aoe',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.94,
      runMultiplier: 0.9,
      accelerationMultiplier: 0.88,
      decelerationMultiplier: 1.12,
      jumpMultiplier: 1.02,
      airControlMultiplier: 1.04,
      weight: 0.98,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 0.9,
      silhouetteHeight: 1.06,
      headScaleY: 1.03,
      armReach: 1.08,
      legStride: 0.86,
      idleSway: 0.78,
      idleBreath: 0.96,
      anticipation: 0.92,
      recoverySpring: 1.04,
      turnaroundEmphasis: 0.86,
      recoilEmphasis: 0.84,
      airborneFloat: 1.08,
      visualSeed: 6.3,
      ambientPreset: 'monad_orbit',
    },
    combat: {
      normalChain: ANSELM_NORMAL_CHAIN,
      normalHitPolicyPresets: { medium: 'double_tap' },
      normalMoveClassPresets: { heavy: 'cross_lane_arc' },
    },
    gimmick: {
      name: 'Necessary Proof',
      description: 'Precise hits build inevitability.',
      trigger: 'on_attack',
      effect: { type: 'energy_gain', value: 0.06 },
    },
    quotes: {
      intro: ['Faith seeks understanding.', 'The proof is already before you.'],
      victory: ['Necessary, not accidental.', 'You conceded the premise.'],
      defeat: ['The objection has force...', 'My proof was interrupted.'],
      special: ['ONTOLOGICAL RAY!', 'GREATER THAN!'],
    },
    colors: { primary: '#F8EDC6', secondary: '#A33A32', accent: '#7FA9D8' },
  },

  hegel: {
    id: 'hegel',
    name: 'G.W.F. Hegel',
    subtitle: 'The Dialectician',
    baseStats: buildCharacterStats('hegel', 105),
    abilities: buildCharacterAbilities('hegel'),
    special: {
      name: 'World-Spirit Domain',
      description: 'Evolve thesis and antithesis into a synthesis field.',
      damage: 22,
      cooldown: 260,
      range: 150,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.92,
      runMultiplier: 0.96,
      accelerationMultiplier: 0.9,
      decelerationMultiplier: 1.02,
      jumpMultiplier: 0.95,
      airControlMultiplier: 0.9,
      weight: 1.12,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.08,
      silhouetteHeight: 1.0,
      armReach: 1.14,
      legStride: 0.96,
      idleSway: 1.18,
      idleBreath: 0.92,
      anticipation: 1.12,
      recoverySpring: 1.0,
      turnaroundEmphasis: 1.08,
      recoilEmphasis: 0.96,
      airborneFloat: 0.9,
      visualSeed: 7.4,
      ambientPreset: 'scheme_smoke',
    },
    combat: {
      normalChain: HEGEL_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Dialectic Build',
      description: 'Sequences grow stronger as thesis becomes synthesis.',
      trigger: 'on_attack',
      effect: { type: 'combo_scaling', value: 0.08 },
    },
    quotes: {
      intro: ['The real is rational.', 'History moves through us.'],
      victory: ['A synthesis was inevitable.', 'You were only the antithesis.'],
      defeat: ['The dialectic continues...', 'Spirit has taken another route.'],
      special: ['WORLD-SPIRIT!', 'SYNTHESIS!'],
    },
    colors: { primary: '#4F7DB5', secondary: '#E0B84D', accent: '#D8C7A1' },
  },

  nietzsche: {
    id: 'nietzsche',
    name: 'Friedrich Nietzsche',
    subtitle: 'The Abyssal Bruiser',
    baseStats: buildCharacterStats('nietzsche', 90),
    abilities: buildCharacterAbilities('nietzsche'),
    special: {
      name: 'Will-to-Power Storm',
      description: 'Risk everything in a lightning-fire storm of self-overcoming.',
      damage: 28,
      cooldown: 240,
      range: 125,
      type: 'aoe',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.02,
      runMultiplier: 1.08,
      accelerationMultiplier: 1.08,
      decelerationMultiplier: 0.88,
      jumpMultiplier: 1.05,
      airControlMultiplier: 0.96,
      weight: 0.92,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.04,
      silhouetteHeight: 0.98,
      headScaleX: 1.08,
      armReach: 1.12,
      legStride: 1.08,
      idleSway: 1.05,
      idleBreath: 1.0,
      anticipation: 1.22,
      recoverySpring: 1.12,
      turnaroundEmphasis: 1.2,
      recoilEmphasis: 1.18,
      airborneFloat: 1.02,
      visualSeed: 8.5,
      ambientPreset: 'absurd_motes',
    },
    combat: {
      normalChain: NIETZSCHE_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Abyssal Risk',
      description: "Dangerous pressure spikes Nietzsche's offensive reward.",
      trigger: 'on_health_loss',
      effect: { type: 'damage_bonus', value: 0.03, per: 0.1 },
    },
    quotes: {
      intro: ['Become who you are.', 'When you gaze into the abyss...'],
      victory: ['The hammer has spoken.', 'I overcame you.'],
      defeat: ['The abyss gazed back...', 'A necessary downfall.'],
      special: ['WILL TO POWER!', 'ABYSS STORM!'],
    },
    colors: { primary: '#F0C13B', secondary: '#3B235A', accent: '#D85A24' },
  },

  foucault: {
    id: 'foucault',
    name: 'Michel Foucault',
    subtitle: 'The Panopticon Archivist',
    baseStats: buildCharacterStats('foucault', 96),
    abilities: buildCharacterAbilities('foucault'),
    special: {
      name: 'Biopower Zone',
      description:
        'Historian of power, discipline, clinics, prisons, sexuality, and discourse recast as a control zoner who turns the arena into an archive of visible bodies. He does not overpower op',
      damage: 18,
      cooldown: 260,
      range: 145,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.92,
      runMultiplier: 0.88,
      accelerationMultiplier: 0.9,
      decelerationMultiplier: 1.06,
      jumpMultiplier: 0.98,
      airControlMultiplier: 1.02,
      weight: 0.96,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.0,
      silhouetteHeight: 1.03,
      armReach: 1.14,
      legStride: 0.88,
      idleSway: 0.96,
      idleBreath: 0.92,
      anticipation: 0.96,
      recoverySpring: 1.0,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 1.08,
      airborneFloat: 1.0,
      visualSeed: 10.25,
      ambientPreset: 'absurd_motes',
    },
    combat: {
      normalChain: FOUCAULT_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Control Zoner',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_hit',
      effect: { type: 'cooldown_refund', value: 0.06 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['BIOPOWER ZONE', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#101114', secondary: '#DDE6E8', accent: '#C9B88A' },
  },

  deleuze_guattari: {
    id: 'deleuze_guattari',
    name: 'Gilles Deleuze / Félix Guattari',
    subtitle: 'The Rhizome Engine',
    baseStats: buildCharacterStats('deleuze_guattari', 102),
    abilities: buildCharacterAbilities('deleuze_guattari'),
    special: {
      name: 'Body-without-Organs Domain',
      description:
        'A duo reimagined as one playable assemblage: two thinkers expressed as a single unstable fighter silhouette of scarf, coat, masks, papers, and living rhizome lines. Their combat di',
      damage: 18,
      cooldown: 260,
      range: 120,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.0,
      runMultiplier: 1.0,
      accelerationMultiplier: 1.0,
      decelerationMultiplier: 1.0,
      jumpMultiplier: 1.0,
      airControlMultiplier: 1.0,
      weight: 1.0,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.0,
      silhouetteHeight: 1.0,
      armReach: 1.14,
      legStride: 1.0,
      idleSway: 1.2,
      idleBreath: 0.92,
      anticipation: 0.96,
      recoverySpring: 1.0,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 1.08,
      airborneFloat: 1.12,
      visualSeed: 11.25,
      ambientPreset: 'monad_orbit',
    },
    combat: {
      normalChain: DELEUZE_GUATTARI_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Swarm / Field Chaos',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_attack',
      effect: { type: 'combo_scaling', value: 0.06 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['BODY-WITHOUT-ORGANS DOMAIN', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#15151A', secondary: '#E7DCC4', accent: '#39FF14' },
  },

  marx: {
    id: 'marx',
    name: 'Karl Marx',
    subtitle: 'The Revolutionary Pressure Engine',
    baseStats: buildCharacterStats('marx', 102),
    abilities: buildCharacterAbilities('marx'),
    special: {
      name: 'Revolution Field',
      description:
        'Critic of capital and theorist of class struggle recast as a pressure scaler. Marx advances with manifesto shockwaves, factory-floor hazards, and collective red-banner momentum tha',
      damage: 18,
      cooldown: 260,
      range: 120,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.0,
      runMultiplier: 1.0,
      accelerationMultiplier: 1.0,
      decelerationMultiplier: 1.0,
      jumpMultiplier: 1.0,
      airControlMultiplier: 1.0,
      weight: 1.0,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.0,
      silhouetteHeight: 0.98,
      armReach: 1.08,
      legStride: 1.0,
      idleSway: 0.96,
      idleBreath: 0.92,
      anticipation: 0.96,
      recoverySpring: 1.0,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 1.08,
      airborneFloat: 1.0,
      visualSeed: 12.25,
      ambientPreset: 'scheme_smoke',
    },
    combat: {
      normalChain: MARX_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Pressure Scaler',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_attack',
      effect: { type: 'combo_scaling', value: 0.06 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['REVOLUTION FIELD', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#1B1B1D', secondary: '#B7B0A6', accent: '#D6C39A' },
  },

  bakunin: {
    id: 'bakunin',
    name: 'Mikhail Bakunin',
    subtitle: 'The Black-Flag Firebrand',
    baseStats: buildCharacterStats('bakunin', 94),
    abilities: buildCharacterAbilities('bakunin'),
    special: {
      name: 'No-Masters Firestorm',
      description:
        'Anarchist revolutionary recast as explosive rushdown: wild beard, black flag, bombs, molotov trails, and reckless forward momentum. Bakunin breaks armor and authority by getting cl',
      damage: 24,
      cooldown: 220,
      range: 120,
      type: 'projectile',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.04,
      runMultiplier: 1.12,
      accelerationMultiplier: 1.12,
      decelerationMultiplier: 0.9,
      jumpMultiplier: 1.04,
      airControlMultiplier: 1.02,
      weight: 0.92,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 0.96,
      silhouetteHeight: 0.98,
      armReach: 1.08,
      legStride: 1.1,
      idleSway: 0.96,
      idleBreath: 0.92,
      anticipation: 1.16,
      recoverySpring: 1.15,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 1.08,
      airborneFloat: 1.0,
      visualSeed: 13.25,
      ambientPreset: 'lantern_flicker',
    },
    combat: {
      normalChain: BAKUNIN_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Explosive Rushdown',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_attack',
      effect: { type: 'energy_gain', value: 0.05 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['NO-MASTERS FIRESTORM', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#141218', secondary: '#050507', accent: '#D21F2B' },
  },

  schmitt: {
    id: 'schmitt',
    name: 'Carl Schmitt',
    subtitle: 'The State of Exception',
    baseStats: buildCharacterStats('schmitt', 112),
    abilities: buildCharacterAbilities('schmitt'),
    special: {
      name: 'State of Exception',
      description:
        'Jurist of sovereignty and exception recast as an armored rule-breaker. Schmitt defines borders, suspends ordinary rules, and advances behind hard rectangular authority effects.',
      damage: 18,
      cooldown: 260,
      range: 120,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.84,
      runMultiplier: 0.82,
      accelerationMultiplier: 0.8,
      decelerationMultiplier: 1.14,
      jumpMultiplier: 0.86,
      airControlMultiplier: 0.78,
      weight: 1.22,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.08,
      silhouetteHeight: 1.0,
      armReach: 1.14,
      legStride: 0.88,
      idleSway: 0.78,
      idleBreath: 1.18,
      anticipation: 0.96,
      recoverySpring: 0.85,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 0.82,
      airborneFloat: 0.85,
      visualSeed: 14.25,
      ambientPreset: 'absurd_motes',
    },
    combat: {
      normalChain: SCHMITT_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Armored Rule-Breaker',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_block',
      effect: { type: 'damage_resist', value: 0.1 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['STATE OF EXCEPTION', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#111217', secondary: '#50545C', accent: '#C8B98C' },
  },

  socrates: {
    id: 'socrates',
    name: 'Socrates',
    subtitle: 'The Gadfly Questioner',
    baseStats: buildCharacterStats('socrates', 92),
    abilities: buildCharacterAbilities('socrates'),
    special: {
      name: 'Apology Backstep',
      description:
        'Athenian gadfly recast as a question/counter trickster. Socrates wins by making the opponent answer: he reflects certainty, stuns with elenchus, traps the arena as an agora, and ba',
      damage: 24,
      cooldown: 220,
      range: 120,
      type: 'projectile',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.02,
      runMultiplier: 1.06,
      accelerationMultiplier: 1.1,
      decelerationMultiplier: 0.94,
      jumpMultiplier: 1.08,
      airControlMultiplier: 1.1,
      weight: 0.9,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 0.96,
      silhouetteHeight: 1.0,
      armReach: 1.08,
      legStride: 1.1,
      idleSway: 0.96,
      idleBreath: 0.92,
      anticipation: 0.96,
      recoverySpring: 1.15,
      turnaroundEmphasis: 1.18,
      recoilEmphasis: 1.08,
      airborneFloat: 1.0,
      visualSeed: 15.25,
      ambientPreset: 'monad_orbit',
    },
    combat: {
      normalChain: SOCRATES_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Question/Counter Trickster',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_block',
      effect: { type: 'recovery_bonus', value: 0.08 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['APOLOGY BACKSTEP', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#E9E0CA', secondary: '#B9855A', accent: '#D1B276' },
  },

  kant: {
    id: 'kant',
    name: 'Immanuel Kant',
    subtitle: 'The Categorical Lawgiver',
    baseStats: buildCharacterStats('kant', 96),
    abilities: buildCharacterAbilities('kant'),
    special: {
      name: 'Kingdom of Ends',
      description:
        'Prussian critical philosopher recast as a lawful control mage. Kant constrains motion with duty sigils, reflects phenomena at the noumenal boundary, and fires universal law as clea',
      damage: 18,
      cooldown: 260,
      range: 145,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 0.92,
      runMultiplier: 0.88,
      accelerationMultiplier: 0.9,
      decelerationMultiplier: 1.06,
      jumpMultiplier: 0.98,
      airControlMultiplier: 1.02,
      weight: 0.96,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.0,
      silhouetteHeight: 1.03,
      armReach: 1.14,
      legStride: 0.88,
      idleSway: 0.96,
      idleBreath: 0.92,
      anticipation: 0.96,
      recoverySpring: 1.0,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 1.08,
      airborneFloat: 1.0,
      visualSeed: 16.25,
      ambientPreset: 'scheme_smoke',
    },
    combat: {
      normalChain: KANT_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Lawful Control Mage',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_hit',
      effect: { type: 'cooldown_refund', value: 0.06 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['KINGDOM OF ENDS', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#17223B', secondary: '#E7E4DA', accent: '#8A8F99' },
  },

  kierkegaard: {
    id: 'kierkegaard',
    name: 'Søren Kierkegaard',
    subtitle: 'The Knight of Faith',
    baseStats: buildCharacterStats('kierkegaard', 102),
    abilities: buildCharacterAbilities('kierkegaard'),
    special: {
      name: 'Knight of Faith',
      description:
        'Danish existential writer recast as a risk/leap specialist. Kierkegaard weaponizes anxiety, irony, and the impossible leap: hesitant in posture, sudden in commitment, fragile unles',
      damage: 18,
      cooldown: 260,
      range: 120,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.0,
      runMultiplier: 1.0,
      accelerationMultiplier: 1.0,
      decelerationMultiplier: 1.0,
      jumpMultiplier: 1.0,
      airControlMultiplier: 1.0,
      weight: 1.0,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 1.0,
      silhouetteHeight: 1.03,
      armReach: 1.08,
      legStride: 1.0,
      idleSway: 0.96,
      idleBreath: 0.92,
      anticipation: 1.16,
      recoverySpring: 1.0,
      turnaroundEmphasis: 0.95,
      recoilEmphasis: 1.08,
      airborneFloat: 1.12,
      visualSeed: 17.25,
      ambientPreset: 'lantern_flicker',
    },
    combat: {
      normalChain: KIERKEGAARD_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Risk / Leap Specialist',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_attack',
      effect: { type: 'combo_scaling', value: 0.06 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['KNIGHT OF FAITH', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#171820', secondary: '#202A44', accent: '#E5D8BA' },
  },

  stirner: {
    id: 'stirner',
    name: 'Max Stirner',
    subtitle: 'The Unique',
    baseStats: buildCharacterStats('stirner', 92),
    abilities: buildCharacterAbilities('stirner'),
    special: {
      name: 'Union of Egoists Domain',
      description:
        'Egoist provocateur recast as a rule-breaking trickster. Stirner attacks concepts as “spooks,” steals pose language from other fighters for a frame, and treats the arena like proper',
      damage: 18,
      cooldown: 260,
      range: 120,
      type: 'buff',
      presentationPreset: 'special_invocation',
    },
    movement: {
      ...DEFAULT_MOVEMENT_PROFILE,
      walkMultiplier: 1.02,
      runMultiplier: 1.06,
      accelerationMultiplier: 1.1,
      decelerationMultiplier: 0.94,
      jumpMultiplier: 1.08,
      airControlMultiplier: 1.1,
      weight: 0.9,
    },
    animation: {
      ...DEFAULT_ANIMATION_PROFILE,
      silhouetteWidth: 0.96,
      silhouetteHeight: 1.0,
      armReach: 1.08,
      legStride: 1.1,
      idleSway: 1.2,
      idleBreath: 0.92,
      anticipation: 0.96,
      recoverySpring: 1.15,
      turnaroundEmphasis: 1.18,
      recoilEmphasis: 1.08,
      airborneFloat: 1.0,
      visualSeed: 18.25,
      ambientPreset: 'absurd_motes',
    },
    combat: {
      normalChain: STIRNER_NORMAL_CHAIN,
      normalMoveClassPresets: { medium: 'pressure_string', heavy: 'launcher' },
    },
    gimmick: {
      name: 'Egoist Trickster',
      description:
        'Placeholder runtime passive derived from the character prompt pack; tune after playtesting.',
      trigger: 'on_block',
      effect: { type: 'recovery_bonus', value: 0.08 },
    },
    quotes: {
      intro: ['Let the argument enter the arena.', 'I bring my method to the fight.'],
      victory: ['The position stands.', 'The field has answered.'],
      defeat: ['A revision is required...', 'The objection lands.'],
      special: ['UNION OF EGOISTS DOMAIN', 'NOW THE CONCEPT MOVES!'],
    },
    colors: { primary: '#101014', secondary: '#D8C171', accent: '#EDE6D0' },
  },
};

/**
 * Get a character by ID
 */
export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS[id];
}

/**
 * Get all character IDs
 */
export function getCharacterIds(): CharacterId[] {
  return Object.keys(CHARACTERS) as CharacterId[];
}

/**
 * Get random character quote
 */
export function getRandomQuote(characterId: CharacterId, type: keyof CharacterQuotes): string {
  const character = CHARACTERS[characterId];
  const quotes = character.quotes[type];
  if (quotes.length === 0) {
    return '';
  }

  return quotes[Math.floor(Math.random() * quotes.length)] ?? quotes[0] ?? '';
}

/**
 * Create a character-authored attack from the default chain
 */
export function getCharacterNormalChain(character: CharacterDefinition): AttackData[] {
  const authoredChain = character.combat?.normalChain;
  if (authoredChain && authoredChain.length > 0) {
    return authoredChain.map((attack) => ({ ...attack }));
  }

  return DEFAULT_ATTACK_CHAIN.map((attack) => {
    const hitPolicyPreset =
      attack.type === 'special'
        ? undefined
        : character.combat?.normalHitPolicyPresets?.[attack.type];
    const moveClassPreset =
      attack.type === 'special'
        ? undefined
        : character.combat?.normalMoveClassPresets?.[attack.type];

    return {
      ...attack,
      ...(hitPolicyPreset ? { hitPolicyPreset } : {}),
      ...(moveClassPreset ? { moveClassPreset } : {}),
    };
  });
}

export function createCharacterAttack(
  character: CharacterDefinition,
  chainIndex: number
): AttackData | null {
  const chain = getCharacterNormalChain(character);
  const attack = chain[chainIndex];

  return attack ? { ...attack } : null;
}

export function getCharacterNormalChainLength(character: CharacterDefinition): number {
  return Math.max(1, getCharacterNormalChain(character).length);
}
