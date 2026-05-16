import type { CharacterId } from '@/content/characters/character-data';
import type { CommandSlot } from '@/game/fight/command-input';
import type { AttackHitPolicyPresetId } from '@/game/fight/hit-policy-presets';
import type { AttackMoveClassPresetId } from '@/game/fight/move-class-presets';

export type SpecialTag =
  | 'projectile'
  | 'beam'
  | 'orb'
  | 'storm'
  | 'field'
  | 'counter'
  | 'summon'
  | 'buff'
  | 'debuff'
  | 'dash'
  | 'teleport'
  | 'launcher'
  | 'anti_air'
  | 'trap'
  | 'chain'
  | 'freeze'
  | 'burn'
  | 'shock'
  | 'slow'
  | 'armor'
  | 'reflect';

export type ProjectileKind =
  | 'magic_ball'
  | 'laser'
  | 'firestorm'
  | 'blizzard'
  | 'chain_lightning'
  | 'shockwave'
  | 'trap_mine'
  | 'summon_field';

export interface ProjectileDefinition {
  id: string;
  kind: ProjectileKind;
  speedX: number;
  speedY: number;
  accelerationX: number;
  accelerationY: number;
  lifetimeFrames: number;
  pierceCount: number;
  bounceCount: number;
  laneBehavior: 'same_lane' | 'adjacent_arc' | 'cross_lane' | 'all_lanes';
  collision: 'aabb' | 'circle' | 'ray' | 'chain';
  gravityScale: number;
  homingStrength?: number;
  chainRadius?: number;
  tickRate?: number;
}

export interface FieldDefinition {
  id: string;
  radius: number;
  durationFrames: number;
  tickRate: number;
  followsCaster: boolean;
}

export type StatusEffectId =
  | 'burn'
  | 'freeze'
  | 'shock'
  | 'slow'
  | 'silence'
  | 'confusion'
  | 'armor'
  | 'reflect'
  | 'exposed'
  | 'rooted';

export interface StatusEffectDefinition {
  id: StatusEffectId;
  durationFrames: number;
  magnitude: number;
  tickRate?: number;
}

export interface CancelWindow {
  fromFrame: number;
  toFrame: number;
  intoTags: readonly SpecialTag[];
}

export interface SpecialMoveDefinition {
  id: string;
  characterId: CharacterId;
  commandSlot: CommandSlot;
  displayName: string;
  energyCost: number;
  cooldownFrames: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  cancelWindows: readonly CancelWindow[];
  tags: readonly SpecialTag[];
  hitPolicyPreset?: AttackHitPolicyPresetId;
  moveClassPreset?: AttackMoveClassPresetId;
  projectile?: ProjectileDefinition;
  field?: FieldDefinition;
  statusEffects?: readonly StatusEffectDefinition[];
  animation: {
    casterClipId: string;
    vfxClipId?: string;
    impactClipId?: string;
  };
}

const DEFAULT_CANCEL_WINDOWS: readonly CancelWindow[] = [
  { fromFrame: 12, toFrame: 18, intoTags: ['dash', 'counter'] },
];

function projectile(
  id: string,
  kind: ProjectileKind,
  overrides: Partial<ProjectileDefinition> = {}
): ProjectileDefinition {
  return {
    id,
    kind,
    speedX: 6,
    speedY: 0,
    accelerationX: 0,
    accelerationY: 0,
    lifetimeFrames: 60,
    pierceCount: 0,
    bounceCount: 0,
    laneBehavior: 'same_lane',
    collision: kind === 'laser' ? 'ray' : kind === 'chain_lightning' ? 'chain' : 'aabb',
    gravityScale: 0,
    ...overrides,
  };
}

function special(
  data: Omit<
    SpecialMoveDefinition,
    'cancelWindows' | 'startupFrames' | 'activeFrames' | 'recoveryFrames'
  > &
    Partial<
      Pick<
        SpecialMoveDefinition,
        'cancelWindows' | 'startupFrames' | 'activeFrames' | 'recoveryFrames'
      >
    >
): SpecialMoveDefinition {
  return {
    startupFrames: 10,
    activeFrames: 12,
    recoveryFrames: 18,
    cancelWindows: DEFAULT_CANCEL_WINDOWS,
    ...data,
  };
}

export const SPECIAL_MOVES: Record<string, SpecialMoveDefinition> = {
  camus_absurd_revolt_wave: special({
    id: 'camus_absurd_revolt_wave',
    characterId: 'camus',
    commandSlot: 'BFA',
    displayName: 'Absurd Revolt Wave',
    energyCost: 18,
    cooldownFrames: 90,
    tags: ['projectile', 'shock'],
    projectile: projectile('camus_absurd_revolt_wave_projectile', 'shockwave', {
      speedX: 5,
      lifetimeFrames: 45,
    }),
    animation: {
      casterClipId: 'camus_BFA',
      vfxClipId: 'shockwave_base',
      impactClipId: 'impact_spark_base',
    },
  }),
  camus_rebel_reversal: special({
    id: 'camus_rebel_reversal',
    characterId: 'camus',
    commandSlot: 'BBA',
    displayName: 'Rebel Reversal',
    energyCost: 16,
    cooldownFrames: 110,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 30, magnitude: 1 }],
    animation: { casterClipId: 'camus_BBA', vfxClipId: 'counter_flash_base' },
  }),
  camus_invincible_summer_dash: special({
    id: 'camus_invincible_summer_dash',
    characterId: 'camus',
    commandSlot: 'BFJ',
    displayName: 'Invincible Summer Dash',
    energyCost: 14,
    cooldownFrames: 80,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 18, magnitude: 1 }],
    animation: { casterClipId: 'camus_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),
  camus_absurd_domain: special({
    id: 'camus_absurd_domain',
    characterId: 'camus',
    commandSlot: 'BDJ',
    displayName: 'The Absurd Domain',
    energyCost: 35,
    cooldownFrames: 260,
    tags: ['field', 'slow', 'debuff'],
    field: {
      id: 'camus_absurd_domain_field',
      radius: 150,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: false,
    },
    statusEffects: [{ id: 'slow', durationFrames: 60, magnitude: 0.25 }],
    animation: { casterClipId: 'camus_BDJ', vfxClipId: 'field_domain_base' },
  }),
  diogenes_lantern_truth_flash: special({
    id: 'diogenes_lantern_truth_flash',
    characterId: 'diogenes',
    commandSlot: 'BFA',
    displayName: 'Lantern Truth Flash',
    energyCost: 18,
    cooldownFrames: 95,
    tags: ['beam', 'debuff', 'shock'],
    projectile: projectile('diogenes_lantern_truth_flash_ray', 'laser', {
      speedX: 0,
      lifetimeFrames: 8,
      pierceCount: 2,
    }),
    statusEffects: [{ id: 'exposed', durationFrames: 75, magnitude: 0.2 }],
    animation: { casterClipId: 'diogenes_BFA', vfxClipId: 'laser_beam_base' },
  }),
  diogenes_barrel_roll_quake: special({
    id: 'diogenes_barrel_roll_quake',
    characterId: 'diogenes',
    commandSlot: 'BDA',
    displayName: 'Barrel Roll Quake',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['projectile', 'shock', 'launcher'],
    moveClassPreset: 'launcher',
    projectile: projectile('diogenes_barrel_roll_quake_wave', 'shockwave', {
      speedX: 4,
      lifetimeFrames: 55,
    }),
    animation: { casterClipId: 'diogenes_BDA', vfxClipId: 'shockwave_base' },
  }),
  diogenes_beggars_scramble: special({
    id: 'diogenes_beggars_scramble',
    characterId: 'diogenes',
    commandSlot: 'BFJ',
    displayName: "Beggar's Scramble",
    energyCost: 14,
    cooldownFrames: 75,
    tags: ['dash', 'armor'],
    statusEffects: [{ id: 'armor', durationFrames: 20, magnitude: 1 }],
    animation: { casterClipId: 'diogenes_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),
  diogenes_tub_retreat: special({
    id: 'diogenes_tub_retreat',
    characterId: 'diogenes',
    commandSlot: 'BBJ',
    displayName: 'Tub Retreat',
    energyCost: 14,
    cooldownFrames: 85,
    tags: ['dash', 'counter', 'armor'],
    statusEffects: [{ id: 'armor', durationFrames: 36, magnitude: 2 }],
    animation: { casterClipId: 'diogenes_BBJ', vfxClipId: 'counter_flash_base' },
  }),
  leibniz_monad_bolt: special({
    id: 'leibniz_monad_bolt',
    characterId: 'leibniz',
    commandSlot: 'BFA',
    displayName: 'Monad Bolt',
    energyCost: 18,
    cooldownFrames: 80,
    tags: ['projectile', 'orb'],
    projectile: projectile('leibniz_monad_bolt_orb', 'magic_ball', {
      speedX: 7,
      lifetimeFrames: 70,
    }),
    animation: {
      casterClipId: 'leibniz_BFA',
      vfxClipId: 'magic_ball_base',
      impactClipId: 'impact_spark_base',
    },
  }),
  leibniz_possible_world_mirror: special({
    id: 'leibniz_possible_world_mirror',
    characterId: 'leibniz',
    commandSlot: 'BBA',
    displayName: 'Possible World Mirror',
    energyCost: 16,
    cooldownFrames: 115,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 45, magnitude: 1 }],
    animation: { casterClipId: 'leibniz_BBA', vfxClipId: 'counter_flash_base' },
  }),
  leibniz_monad_orbit: special({
    id: 'leibniz_monad_orbit',
    characterId: 'leibniz',
    commandSlot: 'BUJ',
    displayName: 'Monad Orbit',
    energyCost: 24,
    cooldownFrames: 160,
    tags: ['summon', 'orb', 'armor'],
    field: {
      id: 'leibniz_monad_orbit_field',
      radius: 90,
      durationFrames: 150,
      tickRate: 25,
      followsCaster: true,
    },
    statusEffects: [{ id: 'armor', durationFrames: 90, magnitude: 1 }],
    animation: { casterClipId: 'leibniz_BUJ', vfxClipId: 'magic_ball_base' },
  }),
  leibniz_best_world_engine: special({
    id: 'leibniz_best_world_engine',
    characterId: 'leibniz',
    commandSlot: 'BDJ',
    displayName: 'Best-World Engine',
    energyCost: 35,
    cooldownFrames: 260,
    tags: ['buff', 'field'],
    field: {
      id: 'leibniz_best_world_engine_field',
      radius: 120,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'leibniz_BDJ', vfxClipId: 'field_domain_base' },
  }),
  machiavelli_princes_gambit_lunge: special({
    id: 'machiavelli_princes_gambit_lunge',
    characterId: 'machiavelli',
    commandSlot: 'BFA',
    displayName: "Prince's Gambit Lunge",
    energyCost: 18,
    cooldownFrames: 80,
    tags: ['dash', 'debuff'],
    statusEffects: [{ id: 'exposed', durationFrames: 90, magnitude: 0.15 }],
    animation: { casterClipId: 'machiavelli_BFA', vfxClipId: 'dash_afterimage_base' },
  }),
  machiavelli_court_intrigue_parry: special({
    id: 'machiavelli_court_intrigue_parry',
    characterId: 'machiavelli',
    commandSlot: 'BBA',
    displayName: 'Court Intrigue Parry',
    energyCost: 16,
    cooldownFrames: 105,
    tags: ['counter'],
    statusEffects: [{ id: 'armor', durationFrames: 22, magnitude: 1 }],
    animation: { casterClipId: 'machiavelli_BBA', vfxClipId: 'counter_flash_base' },
  }),
  machiavelli_coup_trap: special({
    id: 'machiavelli_coup_trap',
    characterId: 'machiavelli',
    commandSlot: 'BDA',
    displayName: 'Coup Trap',
    energyCost: 20,
    cooldownFrames: 130,
    tags: ['trap', 'debuff'],
    projectile: projectile('machiavelli_coup_trap_mine', 'trap_mine', {
      speedX: 0,
      lifetimeFrames: 240,
      collision: 'circle',
    }),
    statusEffects: [{ id: 'rooted', durationFrames: 45, magnitude: 1 }],
    animation: { casterClipId: 'machiavelli_BDA', vfxClipId: 'trap_glyph_base' },
  }),
  machiavelli_opportunist_dash: special({
    id: 'machiavelli_opportunist_dash',
    characterId: 'machiavelli',
    commandSlot: 'BFJ',
    displayName: 'Opportunist Dash',
    energyCost: 14,
    cooldownFrames: 70,
    tags: ['dash', 'teleport'],
    animation: { casterClipId: 'machiavelli_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),

  aristotle_golden_mean_palm: special({
    id: 'aristotle_golden_mean_palm',
    characterId: 'aristotle',
    commandSlot: 'BFA',
    displayName: 'Golden Mean Palm',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['buff', 'shock'],
    statusEffects: [{ id: 'armor', durationFrames: 18, magnitude: 1 }],
    animation: { casterClipId: 'aristotle_BFA', vfxClipId: 'impact_spark_base' },
  }),
  aristotle_teleology_counter: special({
    id: 'aristotle_teleology_counter',
    characterId: 'aristotle',
    commandSlot: 'BBA',
    displayName: 'Teleology Counter',
    energyCost: 16,
    cooldownFrames: 105,
    tags: ['counter'],
    statusEffects: [{ id: 'armor', durationFrames: 24, magnitude: 1 }],
    animation: { casterClipId: 'aristotle_BBA', vfxClipId: 'counter_flash_base' },
  }),
  aristotle_prime_mover_lift: special({
    id: 'aristotle_prime_mover_lift',
    characterId: 'aristotle',
    commandSlot: 'BUA',
    displayName: 'Prime Mover Lift',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['anti_air', 'launcher'],
    moveClassPreset: 'launcher',
    animation: { casterClipId: 'aristotle_BUA', vfxClipId: 'impact_spark_base' },
  }),
  aristotle_virtue_balance_field: special({
    id: 'aristotle_virtue_balance_field',
    characterId: 'aristotle',
    commandSlot: 'BDJ',
    displayName: 'Virtue Balance Field',
    energyCost: 34,
    cooldownFrames: 250,
    tags: ['field', 'buff'],
    field: {
      id: 'aristotle_virtue_balance_field_aura',
      radius: 125,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    statusEffects: [{ id: 'armor', durationFrames: 75, magnitude: 1 }],
    animation: { casterClipId: 'aristotle_BDJ', vfxClipId: 'field_domain_base' },
  }),
  aquinas_five_ways_ray: special({
    id: 'aquinas_five_ways_ray',
    characterId: 'aquinas',
    commandSlot: 'BFA',
    displayName: 'Five Ways Ray',
    energyCost: 20,
    cooldownFrames: 100,
    tags: ['beam', 'shock'],
    projectile: projectile('aquinas_five_ways_ray_beam', 'laser', {
      speedX: 0,
      lifetimeFrames: 10,
      pierceCount: 1,
    }),
    animation: { casterClipId: 'aquinas_BFA', vfxClipId: 'laser_beam_base' },
  }),
  aquinas_scholastic_shield: special({
    id: 'aquinas_scholastic_shield',
    characterId: 'aquinas',
    commandSlot: 'BBA',
    displayName: 'Scholastic Shield',
    energyCost: 18,
    cooldownFrames: 120,
    tags: ['armor', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 60, magnitude: 2 }],
    animation: { casterClipId: 'aquinas_BBA', vfxClipId: 'counter_flash_base' },
  }),
  aquinas_basilica_consecration: special({
    id: 'aquinas_basilica_consecration',
    characterId: 'aquinas',
    commandSlot: 'BDA',
    displayName: 'Basilica Consecration',
    energyCost: 24,
    cooldownFrames: 150,
    tags: ['field', 'armor'],
    field: {
      id: 'aquinas_basilica_consecration_field',
      radius: 105,
      durationFrames: 150,
      tickRate: 30,
      followsCaster: false,
    },
    statusEffects: [{ id: 'armor', durationFrames: 70, magnitude: 1 }],
    animation: { casterClipId: 'aquinas_BDA', vfxClipId: 'field_domain_base' },
  }),
  aquinas_prime_cause_field: special({
    id: 'aquinas_prime_cause_field',
    characterId: 'aquinas',
    commandSlot: 'BDJ',
    displayName: 'Prime Cause Field',
    energyCost: 36,
    cooldownFrames: 280,
    tags: ['field', 'buff', 'armor'],
    field: {
      id: 'aquinas_prime_cause_field_domain',
      radius: 145,
      durationFrames: 190,
      tickRate: 30,
      followsCaster: true,
    },
    statusEffects: [{ id: 'armor', durationFrames: 90, magnitude: 2 }],
    animation: { casterClipId: 'aquinas_BDJ', vfxClipId: 'field_domain_base' },
  }),
  anselm_ontological_ray: special({
    id: 'anselm_ontological_ray',
    characterId: 'anselm',
    commandSlot: 'BFA',
    displayName: 'Ontological Ray',
    energyCost: 19,
    cooldownFrames: 95,
    tags: ['beam', 'debuff'],
    projectile: projectile('anselm_ontological_ray_beam', 'laser', {
      speedX: 0,
      lifetimeFrames: 9,
      pierceCount: 2,
    }),
    statusEffects: [{ id: 'exposed', durationFrames: 70, magnitude: 0.15 }],
    animation: { casterClipId: 'anselm_BFA', vfxClipId: 'laser_beam_base' },
  }),
  anselm_greater_than_counter: special({
    id: 'anselm_greater_than_counter',
    characterId: 'anselm',
    commandSlot: 'BBA',
    displayName: 'Greater-Than Counter',
    energyCost: 17,
    cooldownFrames: 112,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 35, magnitude: 1 }],
    animation: { casterClipId: 'anselm_BBA', vfxClipId: 'counter_flash_base' },
  }),
  anselm_proslogion_rise: special({
    id: 'anselm_proslogion_rise',
    characterId: 'anselm',
    commandSlot: 'BUJ',
    displayName: 'Proslogion Rise',
    energyCost: 22,
    cooldownFrames: 135,
    tags: ['anti_air', 'launcher'],
    moveClassPreset: 'launcher',
    animation: { casterClipId: 'anselm_BUJ', vfxClipId: 'impact_spark_base' },
  }),
  anselm_that_than_which_field: special({
    id: 'anselm_that_than_which_field',
    characterId: 'anselm',
    commandSlot: 'BDJ',
    displayName: 'That-Than-Which Field',
    energyCost: 35,
    cooldownFrames: 250,
    tags: ['field', 'debuff', 'slow'],
    field: {
      id: 'anselm_that_than_which_field_domain',
      radius: 140,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: false,
    },
    statusEffects: [{ id: 'slow', durationFrames: 70, magnitude: 0.2 }],
    animation: { casterClipId: 'anselm_BDJ', vfxClipId: 'field_domain_base' },
  }),
  hegel_thesis_bolt: special({
    id: 'hegel_thesis_bolt',
    characterId: 'hegel',
    commandSlot: 'BFA',
    displayName: 'Thesis Bolt',
    energyCost: 18,
    cooldownFrames: 82,
    tags: ['projectile', 'orb'],
    projectile: projectile('hegel_thesis_bolt_orb', 'magic_ball', {
      speedX: 6,
      lifetimeFrames: 60,
    }),
    animation: { casterClipId: 'hegel_BFA', vfxClipId: 'magic_ball_base' },
  }),
  hegel_antithesis_reversal: special({
    id: 'hegel_antithesis_reversal',
    characterId: 'hegel',
    commandSlot: 'BBA',
    displayName: 'Antithesis Reversal',
    energyCost: 17,
    cooldownFrames: 115,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 30, magnitude: 1 }],
    animation: { casterClipId: 'hegel_BBA', vfxClipId: 'counter_flash_base' },
  }),
  hegel_synthesis_dash: special({
    id: 'hegel_synthesis_dash',
    characterId: 'hegel',
    commandSlot: 'BFJ',
    displayName: 'Synthesis Dash',
    energyCost: 16,
    cooldownFrames: 82,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 16, magnitude: 1 }],
    animation: { casterClipId: 'hegel_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),
  hegel_world_spirit_domain: special({
    id: 'hegel_world_spirit_domain',
    characterId: 'hegel',
    commandSlot: 'BDJ',
    displayName: 'World-Spirit Domain',
    energyCost: 36,
    cooldownFrames: 270,
    tags: ['field', 'buff'],
    field: {
      id: 'hegel_world_spirit_domain_field',
      radius: 145,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'hegel_BDJ', vfxClipId: 'field_domain_base' },
  }),
  nietzsche_hammer_aphorism: special({
    id: 'nietzsche_hammer_aphorism',
    characterId: 'nietzsche',
    commandSlot: 'BFA',
    displayName: 'Hammer Aphorism',
    energyCost: 18,
    cooldownFrames: 85,
    tags: ['projectile', 'shock'],
    projectile: projectile('nietzsche_hammer_aphorism_wave', 'shockwave', {
      speedX: 5,
      lifetimeFrames: 45,
    }),
    animation: { casterClipId: 'nietzsche_BFA', vfxClipId: 'shockwave_base' },
  }),
  nietzsche_eternal_return_counter: special({
    id: 'nietzsche_eternal_return_counter',
    characterId: 'nietzsche',
    commandSlot: 'BBA',
    displayName: 'Eternal Return Counter',
    energyCost: 16,
    cooldownFrames: 105,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 28, magnitude: 1 }],
    animation: { casterClipId: 'nietzsche_BBA', vfxClipId: 'counter_flash_base' },
  }),
  nietzsche_overman_rush: special({
    id: 'nietzsche_overman_rush',
    characterId: 'nietzsche',
    commandSlot: 'BFJ',
    displayName: 'Overman Rush',
    energyCost: 14,
    cooldownFrames: 70,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 14, magnitude: 1 }],
    animation: { casterClipId: 'nietzsche_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),
  nietzsche_will_to_power_storm: special({
    id: 'nietzsche_will_to_power_storm',
    characterId: 'nietzsche',
    commandSlot: 'BDJ',
    displayName: 'Will-to-Power Storm',
    energyCost: 38,
    cooldownFrames: 250,
    tags: ['field', 'storm', 'burn'],
    field: {
      id: 'nietzsche_will_to_power_storm_field',
      radius: 135,
      durationFrames: 170,
      tickRate: 20,
      followsCaster: false,
    },
    statusEffects: [{ id: 'burn', durationFrames: 90, magnitude: 0.25, tickRate: 20 }],
    animation: { casterClipId: 'nietzsche_BDJ', vfxClipId: 'field_domain_base' },
  }),

  foucault_discipline_beam: special({
    id: 'foucault_discipline_beam',
    characterId: 'foucault',
    commandSlot: 'BFA',
    displayName: 'Discipline Beam',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'beam'],
    projectile: projectile('foucault_discipline_beam_projectile', 'laser', {
      speedX: 0,
      lifetimeFrames: 10,
      pierceCount: 1,
    }),
    animation: { casterClipId: 'foucault_BFA', vfxClipId: 'laser_beam_base' },
  }),

  foucault_prison_grid_field: special({
    id: 'foucault_prison_grid_field',
    characterId: 'foucault',
    commandSlot: 'BDA',
    displayName: 'Prison Grid Field',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['field', 'debuff', 'slow'],
    field: {
      id: 'foucault_prison_grid_field_field',
      radius: 128,
      durationFrames: 160,
      tickRate: 30,
      followsCaster: false,
    },
    statusEffects: [{ id: 'slow', durationFrames: 60, magnitude: 0.18 }],
    animation: { casterClipId: 'foucault_BDA', vfxClipId: 'field_domain_base' },
  }),

  foucault_discourse_escape: special({
    id: 'foucault_discourse_escape',
    characterId: 'foucault',
    commandSlot: 'BBJ',
    displayName: 'Discourse Escape',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 14, magnitude: 1 }],
    animation: { casterClipId: 'foucault_BBJ', vfxClipId: 'dash_afterimage_base' },
  }),

  foucault_biopower_zone: special({
    id: 'foucault_biopower_zone',
    characterId: 'foucault',
    commandSlot: 'BDJ',
    displayName: 'Biopower Zone',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'foucault_biopower_zone_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'foucault_BDJ', vfxClipId: 'field_domain_base' },
  }),

  deleuze_guattari_rhizome_lash: special({
    id: 'deleuze_guattari_rhizome_lash',
    characterId: 'deleuze_guattari',
    commandSlot: 'BFA',
    displayName: 'Rhizome Lash',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'shock'],
    projectile: projectile('deleuze_guattari_rhizome_lash_projectile', 'shockwave', {
      speedX: 5,
      lifetimeFrames: 50,
    }),
    animation: { casterClipId: 'deleuze_guattari_BFA', vfxClipId: 'shockwave_base' },
  }),

  deleuze_guattari_thousand_plateaus_rise: special({
    id: 'deleuze_guattari_thousand_plateaus_rise',
    characterId: 'deleuze_guattari',
    commandSlot: 'BUA',
    displayName: 'Thousand Plateaus Rise',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['anti_air', 'launcher'],
    animation: { casterClipId: 'deleuze_guattari_BUA', vfxClipId: 'impact_spark_base' },
  }),

  deleuze_guattari_line_of_flight_dash: special({
    id: 'deleuze_guattari_line_of_flight_dash',
    characterId: 'deleuze_guattari',
    commandSlot: 'BFJ',
    displayName: 'Line-of-Flight Dash',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 14, magnitude: 1 }],
    animation: { casterClipId: 'deleuze_guattari_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),

  deleuze_guattari_body_without_organs_domain: special({
    id: 'deleuze_guattari_body_without_organs_domain',
    characterId: 'deleuze_guattari',
    commandSlot: 'BDJ',
    displayName: 'Body-without-Organs Domain',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'deleuze_guattari_body_without_organs_domain_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'deleuze_guattari_BDJ', vfxClipId: 'field_domain_base' },
  }),

  marx_manifesto_shockwave: special({
    id: 'marx_manifesto_shockwave',
    characterId: 'marx',
    commandSlot: 'BFA',
    displayName: 'Manifesto Shockwave',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'shock'],
    projectile: projectile('marx_manifesto_shockwave_projectile', 'shockwave', {
      speedX: 5,
      lifetimeFrames: 50,
    }),
    animation: { casterClipId: 'marx_BFA', vfxClipId: 'shockwave_base' },
  }),

  marx_factory_floor_hazard: special({
    id: 'marx_factory_floor_hazard',
    characterId: 'marx',
    commandSlot: 'BDA',
    displayName: 'Factory Floor Hazard',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['trap', 'field'],
    projectile: projectile('marx_factory_floor_hazard_trap', 'trap_mine', {
      speedX: 0,
      lifetimeFrames: 120,
    }),
    statusEffects: [{ id: 'rooted', durationFrames: 55, magnitude: 1 }],
    animation: { casterClipId: 'marx_BDA', vfxClipId: 'field_domain_base' },
  }),

  marx_red_banner_rise: special({
    id: 'marx_red_banner_rise',
    characterId: 'marx',
    commandSlot: 'BUJ',
    displayName: 'Red Banner Rise',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['anti_air', 'launcher'],
    animation: { casterClipId: 'marx_BUJ', vfxClipId: 'impact_spark_base' },
  }),

  marx_revolution_field: special({
    id: 'marx_revolution_field',
    characterId: 'marx',
    commandSlot: 'BDJ',
    displayName: 'Revolution Field',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'marx_revolution_field_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'marx_BDJ', vfxClipId: 'field_domain_base' },
  }),

  bakunin_anarch_bomb: special({
    id: 'bakunin_anarch_bomb',
    characterId: 'bakunin',
    commandSlot: 'BFA',
    displayName: 'Anarch Bomb',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'shock'],
    projectile: projectile('bakunin_anarch_bomb_projectile', 'shockwave', {
      speedX: 5,
      lifetimeFrames: 50,
    }),
    animation: { casterClipId: 'bakunin_BFA', vfxClipId: 'shockwave_base' },
  }),

  bakunin_molotov_groundfire: special({
    id: 'bakunin_molotov_groundfire',
    characterId: 'bakunin',
    commandSlot: 'BDA',
    displayName: 'Molotov Groundfire',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['trap', 'field'],
    projectile: projectile('bakunin_molotov_groundfire_trap', 'trap_mine', {
      speedX: 0,
      lifetimeFrames: 120,
    }),
    statusEffects: [{ id: 'rooted', durationFrames: 55, magnitude: 1 }],
    animation: { casterClipId: 'bakunin_BDA', vfxClipId: 'field_domain_base' },
  }),

  bakunin_insurrection_dash: special({
    id: 'bakunin_insurrection_dash',
    characterId: 'bakunin',
    commandSlot: 'BFJ',
    displayName: 'Insurrection Dash',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 14, magnitude: 1 }],
    animation: { casterClipId: 'bakunin_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),

  bakunin_no_masters_firestorm: special({
    id: 'bakunin_no_masters_firestorm',
    characterId: 'bakunin',
    commandSlot: 'BDJ',
    displayName: 'No-Masters Firestorm',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'storm', 'burn'],
    field: {
      id: 'bakunin_no_masters_firestorm_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    statusEffects: [{ id: 'burn', durationFrames: 70, magnitude: 0.2, tickRate: 20 }],
    animation: { casterClipId: 'bakunin_BDJ', vfxClipId: 'field_domain_base' },
  }),

  schmitt_sovereign_beam: special({
    id: 'schmitt_sovereign_beam',
    characterId: 'schmitt',
    commandSlot: 'BFA',
    displayName: 'Sovereign Beam',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'beam'],
    projectile: projectile('schmitt_sovereign_beam_projectile', 'laser', {
      speedX: 0,
      lifetimeFrames: 10,
      pierceCount: 1,
    }),
    animation: { casterClipId: 'schmitt_BFA', vfxClipId: 'laser_beam_base' },
  }),

  schmitt_exception_counter: special({
    id: 'schmitt_exception_counter',
    characterId: 'schmitt',
    commandSlot: 'BBA',
    displayName: 'Exception Counter',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['field', 'buff'],
    field: {
      id: 'schmitt_exception_counter_field',
      radius: 128,
      durationFrames: 160,
      tickRate: 30,
      followsCaster: false,
    },
    animation: { casterClipId: 'schmitt_BBA', vfxClipId: 'field_domain_base' },
  }),

  schmitt_border_wall_field: special({
    id: 'schmitt_border_wall_field',
    characterId: 'schmitt',
    commandSlot: 'BDA',
    displayName: 'Border Wall Field',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['trap', 'field'],
    projectile: projectile('schmitt_border_wall_field_trap', 'trap_mine', {
      speedX: 0,
      lifetimeFrames: 120,
    }),
    statusEffects: [{ id: 'rooted', durationFrames: 55, magnitude: 1 }],
    animation: { casterClipId: 'schmitt_BDA', vfxClipId: 'field_domain_base' },
  }),

  schmitt_state_of_exception: special({
    id: 'schmitt_state_of_exception',
    characterId: 'schmitt',
    commandSlot: 'BDJ',
    displayName: 'State of Exception',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'schmitt_state_of_exception_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'schmitt_BDJ', vfxClipId: 'field_domain_base' },
  }),

  socrates_elenchus_bolt: special({
    id: 'socrates_elenchus_bolt',
    characterId: 'socrates',
    commandSlot: 'BFA',
    displayName: 'Elenchus Bolt',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'beam'],
    projectile: projectile('socrates_elenchus_bolt_projectile', 'laser', {
      speedX: 0,
      lifetimeFrames: 10,
      pierceCount: 1,
    }),
    animation: { casterClipId: 'socrates_BFA', vfxClipId: 'laser_beam_base' },
  }),

  socrates_question_reversal: special({
    id: 'socrates_question_reversal',
    characterId: 'socrates',
    commandSlot: 'BBA',
    displayName: 'Question Reversal',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 30, magnitude: 1 }],
    animation: { casterClipId: 'socrates_BBA', vfxClipId: 'counter_flash_base' },
  }),

  socrates_agora_trap: special({
    id: 'socrates_agora_trap',
    characterId: 'socrates',
    commandSlot: 'BDA',
    displayName: 'Agora Trap',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['trap', 'field'],
    projectile: projectile('socrates_agora_trap_trap', 'trap_mine', {
      speedX: 0,
      lifetimeFrames: 120,
    }),
    statusEffects: [{ id: 'rooted', durationFrames: 55, magnitude: 1 }],
    animation: { casterClipId: 'socrates_BDA', vfxClipId: 'field_domain_base' },
  }),

  socrates_apology_backstep: special({
    id: 'socrates_apology_backstep',
    characterId: 'socrates',
    commandSlot: 'BBJ',
    displayName: 'Apology Backstep',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 14, magnitude: 1 }],
    animation: { casterClipId: 'socrates_BBJ', vfxClipId: 'dash_afterimage_base' },
  }),

  kant_universal_law_beam: special({
    id: 'kant_universal_law_beam',
    characterId: 'kant',
    commandSlot: 'BFA',
    displayName: 'Universal Law Beam',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['projectile', 'beam'],
    projectile: projectile('kant_universal_law_beam_projectile', 'laser', {
      speedX: 0,
      lifetimeFrames: 10,
      pierceCount: 1,
    }),
    animation: { casterClipId: 'kant_BFA', vfxClipId: 'laser_beam_base' },
  }),

  kant_noumenal_reflect: special({
    id: 'kant_noumenal_reflect',
    characterId: 'kant',
    commandSlot: 'BBA',
    displayName: 'Noumenal Reflect',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 30, magnitude: 1 }],
    animation: { casterClipId: 'kant_BBA', vfxClipId: 'counter_flash_base' },
  }),

  kant_duty_sigil: special({
    id: 'kant_duty_sigil',
    characterId: 'kant',
    commandSlot: 'BDA',
    displayName: 'Duty Sigil',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['trap', 'field'],
    projectile: projectile('kant_duty_sigil_trap', 'trap_mine', { speedX: 0, lifetimeFrames: 120 }),
    statusEffects: [{ id: 'rooted', durationFrames: 55, magnitude: 1 }],
    animation: { casterClipId: 'kant_BDA', vfxClipId: 'field_domain_base' },
  }),

  kant_kingdom_of_ends: special({
    id: 'kant_kingdom_of_ends',
    characterId: 'kant',
    commandSlot: 'BDJ',
    displayName: 'Kingdom of Ends',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'kant_kingdom_of_ends_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'kant_BDJ', vfxClipId: 'field_domain_base' },
  }),

  kierkegaard_leap_of_faith_strike: special({
    id: 'kierkegaard_leap_of_faith_strike',
    characterId: 'kierkegaard',
    commandSlot: 'BFA',
    displayName: 'Leap-of-Faith Strike',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['field', 'buff'],
    field: {
      id: 'kierkegaard_leap_of_faith_strike_field',
      radius: 120,
      durationFrames: 150,
      tickRate: 30,
      followsCaster: false,
    },
    animation: { casterClipId: 'kierkegaard_BFA', vfxClipId: 'field_domain_base' },
  }),

  kierkegaard_either_or_upper: special({
    id: 'kierkegaard_either_or_upper',
    characterId: 'kierkegaard',
    commandSlot: 'BUA',
    displayName: 'Either/Or Upper',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['anti_air', 'launcher'],
    animation: { casterClipId: 'kierkegaard_BUA', vfxClipId: 'impact_spark_base' },
  }),

  kierkegaard_faith_dash: special({
    id: 'kierkegaard_faith_dash',
    characterId: 'kierkegaard',
    commandSlot: 'BFJ',
    displayName: 'Faith Dash',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['field', 'buff'],
    field: {
      id: 'kierkegaard_faith_dash_field',
      radius: 136,
      durationFrames: 170,
      tickRate: 30,
      followsCaster: false,
    },
    animation: { casterClipId: 'kierkegaard_BFJ', vfxClipId: 'field_domain_base' },
  }),

  kierkegaard_knight_of_faith: special({
    id: 'kierkegaard_knight_of_faith',
    characterId: 'kierkegaard',
    commandSlot: 'BDJ',
    displayName: 'Knight of Faith',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'kierkegaard_knight_of_faith_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'kierkegaard_BDJ', vfxClipId: 'field_domain_base' },
  }),

  stirner_egoist_appropriation: special({
    id: 'stirner_egoist_appropriation',
    characterId: 'stirner',
    commandSlot: 'BFA',
    displayName: 'Egoist Appropriation',
    energyCost: 16,
    cooldownFrames: 85,
    tags: ['buff'],
    animation: { casterClipId: 'stirner_BFA', vfxClipId: 'impact_spark_base' },
  }),

  stirner_spook_reversal: special({
    id: 'stirner_spook_reversal',
    characterId: 'stirner',
    commandSlot: 'BBA',
    displayName: 'Spook Reversal',
    energyCost: 20,
    cooldownFrames: 120,
    tags: ['counter', 'reflect'],
    statusEffects: [{ id: 'reflect', durationFrames: 30, magnitude: 1 }],
    animation: { casterClipId: 'stirner_BBA', vfxClipId: 'counter_flash_base' },
  }),

  stirner_ownness_dash: special({
    id: 'stirner_ownness_dash',
    characterId: 'stirner',
    commandSlot: 'BFJ',
    displayName: 'Ownness Dash',
    energyCost: 24,
    cooldownFrames: 155,
    tags: ['dash', 'buff'],
    statusEffects: [{ id: 'armor', durationFrames: 14, magnitude: 1 }],
    animation: { casterClipId: 'stirner_BFJ', vfxClipId: 'dash_afterimage_base' },
  }),

  stirner_union_of_egoists_domain: special({
    id: 'stirner_union_of_egoists_domain',
    characterId: 'stirner',
    commandSlot: 'BDJ',
    displayName: 'Union of Egoists Domain',
    energyCost: 28,
    cooldownFrames: 190,
    tags: ['field', 'buff'],
    field: {
      id: 'stirner_union_of_egoists_domain_field',
      radius: 144,
      durationFrames: 180,
      tickRate: 30,
      followsCaster: true,
    },
    animation: { casterClipId: 'stirner_BDJ', vfxClipId: 'field_domain_base' },
  }),
};

export function getSpecialMove(id: string): SpecialMoveDefinition | undefined {
  return SPECIAL_MOVES[id];
}

export function getSpecialsForCharacter(characterId: CharacterId): SpecialMoveDefinition[] {
  return Object.values(SPECIAL_MOVES).filter(
    (specialMove) => specialMove.characterId === characterId
  );
}

export function getSpecialByCommandSlot(
  characterId: CharacterId,
  commandSlot: CommandSlot
): SpecialMoveDefinition | undefined {
  return getSpecialsForCharacter(characterId).find(
    (specialMove) => specialMove.commandSlot === commandSlot
  );
}
