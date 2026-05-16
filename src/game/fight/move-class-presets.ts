export type AttackLaunchClassId = 'grounded' | 'pop_up' | 'launcher';
export type AttackChipBlockProfileId = 'standard' | 'pressure' | 'guard_break';
export type AttackCounterHitProfileId = 'standard' | 'frame_trap' | 'launcher_punish';
export type AttackLaneReachId = 'same_lane' | 'adjacent' | 'sweep';

export interface AttackMoveClass {
  launchClass?: AttackLaunchClassId;
  chipBlockProfile?: AttackChipBlockProfileId;
  counterHitProfile?: AttackCounterHitProfileId;
  laneReach?: AttackLaneReachId;
}

export type AttackMoveClassPresetId =
  | 'standard_strike'
  | 'pressure_string'
  | 'launcher'
  | 'cross_lane_arc';

export interface AttackMoveClassPreset extends Required<AttackMoveClass> {
  id: AttackMoveClassPresetId;
  label: string;
  description: string;
}

export const ATTACK_MOVE_CLASS_PRESETS: Record<AttackMoveClassPresetId, AttackMoveClassPreset> = {
  standard_strike: {
    id: 'standard_strike',
    label: 'Standard Strike',
    description: 'Default lane-locked grounded strike.',
    launchClass: 'grounded',
    chipBlockProfile: 'standard',
    counterHitProfile: 'standard',
    laneReach: 'same_lane',
  },
  pressure_string: {
    id: 'pressure_string',
    label: 'Pressure String',
    description: 'Safer pressure with better chip and frame-trap reward.',
    launchClass: 'grounded',
    chipBlockProfile: 'pressure',
    counterHitProfile: 'frame_trap',
    laneReach: 'same_lane',
  },
  launcher: {
    id: 'launcher',
    label: 'Launcher',
    description: 'Grounded opener that pops targets airborne and rewards counter-hits.',
    launchClass: 'launcher',
    chipBlockProfile: 'standard',
    counterHitProfile: 'launcher_punish',
    laneReach: 'same_lane',
  },
  cross_lane_arc: {
    id: 'cross_lane_arc',
    label: 'Cross-Lane Arc',
    description: 'An arcing strike that can connect into adjacent lanes.',
    launchClass: 'pop_up',
    chipBlockProfile: 'standard',
    counterHitProfile: 'standard',
    laneReach: 'adjacent',
  },
};

const DEFAULT_ATTACK_MOVE_CLASS: Required<AttackMoveClass> = {
  launchClass: 'grounded',
  chipBlockProfile: 'standard',
  counterHitProfile: 'standard',
  laneReach: 'same_lane',
};

export interface AttackMoveClassSource {
  moveClass?: AttackMoveClass;
  moveClassPreset?: AttackMoveClassPresetId;
}

export interface LaunchClassBehavior {
  forceAirborne: boolean;
  knockbackYMultiplier: number;
  minimumKnockbackY: number;
  bonusHitstun: number;
}

export interface ChipBlockProfileBehavior {
  chipDamageRatio: number;
  pushbackMultiplier: number;
  blockstunMultiplier: number;
  attackerRecoilMultiplier: number;
}

export interface CounterHitProfileBehavior {
  damageMultiplier: number;
  hitstunBonus: number;
  knockbackXMultiplier: number;
  knockbackYBonus: number;
}

export const LAUNCH_CLASS_BEHAVIOR: Record<AttackLaunchClassId, LaunchClassBehavior> = {
  grounded: {
    forceAirborne: false,
    knockbackYMultiplier: 1,
    minimumKnockbackY: 0,
    bonusHitstun: 0,
  },
  pop_up: {
    forceAirborne: true,
    knockbackYMultiplier: 1.15,
    minimumKnockbackY: 2,
    bonusHitstun: 1,
  },
  launcher: {
    forceAirborne: true,
    knockbackYMultiplier: 1.6,
    minimumKnockbackY: 4,
    bonusHitstun: 4,
  },
};

export const CHIP_BLOCK_PROFILE_BEHAVIOR: Record<
  AttackChipBlockProfileId,
  ChipBlockProfileBehavior
> = {
  standard: {
    chipDamageRatio: 0.1,
    pushbackMultiplier: 0.3,
    blockstunMultiplier: 0.5,
    attackerRecoilMultiplier: 1,
  },
  pressure: {
    chipDamageRatio: 0.28,
    pushbackMultiplier: 0.4,
    blockstunMultiplier: 0.72,
    attackerRecoilMultiplier: 0.88,
  },
  guard_break: {
    chipDamageRatio: 0.22,
    pushbackMultiplier: 0.52,
    blockstunMultiplier: 0.82,
    attackerRecoilMultiplier: 0.8,
  },
};

export const COUNTER_HIT_PROFILE_BEHAVIOR: Record<
  AttackCounterHitProfileId,
  CounterHitProfileBehavior
> = {
  standard: {
    damageMultiplier: 1.08,
    hitstunBonus: 2,
    knockbackXMultiplier: 1.08,
    knockbackYBonus: 0,
  },
  frame_trap: {
    damageMultiplier: 1.12,
    hitstunBonus: 6,
    knockbackXMultiplier: 1.05,
    knockbackYBonus: 0,
  },
  launcher_punish: {
    damageMultiplier: 1.15,
    hitstunBonus: 5,
    knockbackXMultiplier: 1.1,
    knockbackYBonus: 2,
  },
};

export const LANE_REACH_MAX_DELTA: Record<AttackLaneReachId, number> = {
  same_lane: 0,
  adjacent: 1,
  sweep: 2,
};

export function getAttackMoveClassPreset(
  presetId?: AttackMoveClassPresetId
): AttackMoveClassPreset | null {
  if (!presetId) {
    return null;
  }

  return ATTACK_MOVE_CLASS_PRESETS[presetId] ?? null;
}

export function resolveAttackMoveClass(source: AttackMoveClassSource): Required<AttackMoveClass> {
  const preset = getAttackMoveClassPreset(source.moveClassPreset);

  return {
    launchClass:
      source.moveClass?.launchClass ?? preset?.launchClass ?? DEFAULT_ATTACK_MOVE_CLASS.launchClass,
    chipBlockProfile:
      source.moveClass?.chipBlockProfile ??
      preset?.chipBlockProfile ??
      DEFAULT_ATTACK_MOVE_CLASS.chipBlockProfile,
    counterHitProfile:
      source.moveClass?.counterHitProfile ??
      preset?.counterHitProfile ??
      DEFAULT_ATTACK_MOVE_CLASS.counterHitProfile,
    laneReach:
      source.moveClass?.laneReach ?? preset?.laneReach ?? DEFAULT_ATTACK_MOVE_CLASS.laneReach,
  };
}
