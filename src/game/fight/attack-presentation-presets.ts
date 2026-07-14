import type { Fighter } from './fighter';
import type { AttackData, Lane } from './fighter-state';
import type { FightVisualEffect, FightVisualEffectPresetId } from './visual-effects';

export type AttackPresentationPresetId =
  | 'jab_snap'
  | 'rebel_wave'
  | 'heel_drop'
  | 'monad_sweep'
  | 'launcher_crack'
  | 'cynic_flurry'
  | 'special_invocation'
  | 'counter_riposte';

export type AttackChoreographyId =
  | 'straight'
  | 'sweep'
  | 'heel'
  | 'orbit'
  | 'launcher'
  | 'flurry'
  | 'invocation'
  | 'riposte';

export interface AttackPresentationCue {
  frame: number;
  effectPreset?: FightVisualEffectPresetId;
  effectLayer?: 'behind' | 'front';
  effectScale?: number;
  effectColor?: string;
  effectTtl?: number;
  anchor?: 'attacker' | 'strike';
  offsetX?: number;
  offsetY?: number;
  cameraShake?: number;
  cameraZoom?: number;
  cameraTtl?: number;
}

export function resolveAttackChoreography(attack: AttackData): AttackChoreographyId {
  return resolveAttackPresentationProfile(attack).choreography;
}

export interface AttackMicroTimingProfile {
  startupShift: number;
  activeShift: number;
  recoveryShift: number;
  reachJitter: number;
  leanJitter: number;
  twistJitter: number;
  cadenceJitter: number;
}

export interface AttackPresentationProfile {
  cues: AttackPresentationCue[];
  microTiming: AttackMicroTimingProfile;
  choreography: AttackChoreographyId;
}

export interface AttackMotionVariation {
  startupShift: number;
  activeShift: number;
  recoveryShift: number;
  reachJitter: number;
  leanJitter: number;
  twistJitter: number;
  cadenceJitter: number;
}

export interface FightCameraEffect {
  id: string;
  ttl: number;
  totalTtl: number;
  shake: number;
  zoomDelta: number;
}

const DEFAULT_MICRO_TIMING: AttackMicroTimingProfile = {
  startupShift: 0.04,
  activeShift: 0.03,
  recoveryShift: 0.03,
  reachJitter: 0.05,
  leanJitter: 0.04,
  twistJitter: 0.04,
  cadenceJitter: 0.08,
};

const PRESENTATION_PRESETS: Record<AttackPresentationPresetId, AttackPresentationProfile> = {
  jab_snap: {
    choreography: 'straight',
    cues: [
      {
        frame: 0,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 0.8,
        anchor: 'attacker',
        offsetY: -54,
      },
      {
        frame: 2,
        effectPreset: 'swing_arc_light',
        effectLayer: 'front',
        effectScale: 1,
        anchor: 'strike',
        cameraShake: 1.2,
        cameraZoom: 0.008,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      startupShift: 0.03,
      reachJitter: 0.04,
      cadenceJitter: 0.05,
    },
  },
  rebel_wave: {
    choreography: 'sweep',
    cues: [
      {
        frame: 1,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 1,
        anchor: 'attacker',
        offsetY: -58,
        cameraShake: 0.8,
      },
      {
        frame: 4,
        effectPreset: 'swing_arc_medium',
        effectLayer: 'front',
        effectScale: 1.1,
        anchor: 'strike',
        cameraShake: 2.4,
        cameraZoom: 0.012,
      },
      {
        frame: 8,
        effectPreset: 'recovery_echo',
        effectLayer: 'behind',
        effectScale: 0.9,
        anchor: 'attacker',
        offsetY: -42,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      startupShift: 0.05,
      activeShift: 0.04,
      reachJitter: 0.06,
      leanJitter: 0.05,
    },
  },
  heel_drop: {
    choreography: 'heel',
    cues: [
      {
        frame: 1,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 0.9,
        anchor: 'attacker',
        offsetY: -48,
      },
      {
        frame: 5,
        effectPreset: 'swing_arc_heavy',
        effectLayer: 'front',
        effectScale: 1.12,
        anchor: 'strike',
        cameraShake: 3.4,
        cameraZoom: 0.018,
      },
      {
        frame: 8,
        effectPreset: 'recovery_echo',
        effectLayer: 'behind',
        effectScale: 1,
        anchor: 'attacker',
        offsetY: -24,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      activeShift: 0.05,
      recoveryShift: 0.05,
      reachJitter: 0.07,
      leanJitter: 0.06,
      twistJitter: 0.05,
    },
  },
  monad_sweep: {
    choreography: 'orbit',
    cues: [
      {
        frame: 1,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 0.92,
        anchor: 'attacker',
        offsetY: -50,
      },
      {
        frame: 4,
        effectPreset: 'swing_arc_medium',
        effectLayer: 'front',
        effectScale: 1.08,
        anchor: 'strike',
        cameraShake: 2.2,
        cameraZoom: 0.011,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      activeShift: 0.04,
      reachJitter: 0.06,
      cadenceJitter: 0.07,
    },
  },
  launcher_crack: {
    choreography: 'launcher',
    cues: [
      {
        frame: 1,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 1.08,
        anchor: 'attacker',
        offsetY: -56,
        cameraShake: 1.1,
      },
      {
        frame: 3,
        effectPreset: 'swing_arc_heavy',
        effectLayer: 'front',
        effectScale: 1.2,
        anchor: 'strike',
        cameraShake: 4.2,
        cameraZoom: 0.024,
        cameraTtl: 7,
      },
      {
        frame: 7,
        effectPreset: 'recovery_echo',
        effectLayer: 'behind',
        effectScale: 1.05,
        anchor: 'attacker',
        offsetY: -36,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      startupShift: 0.05,
      activeShift: 0.06,
      recoveryShift: 0.06,
      reachJitter: 0.08,
      leanJitter: 0.07,
      twistJitter: 0.06,
      cadenceJitter: 0.09,
    },
  },
  cynic_flurry: {
    choreography: 'flurry',
    cues: [
      {
        frame: 0,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 0.76,
        anchor: 'attacker',
        offsetY: -46,
      },
      {
        frame: 2,
        effectPreset: 'swing_arc_light',
        effectLayer: 'front',
        effectScale: 0.96,
        anchor: 'strike',
        cameraShake: 1.5,
        cameraZoom: 0.009,
      },
      {
        frame: 5,
        effectPreset: 'swing_arc_medium',
        effectLayer: 'front',
        effectScale: 1.02,
        anchor: 'strike',
        cameraShake: 1.8,
        cameraZoom: 0.01,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      startupShift: 0.06,
      activeShift: 0.05,
      reachJitter: 0.05,
      cadenceJitter: 0.1,
    },
  },
  special_invocation: {
    choreography: 'invocation',
    cues: [
      {
        frame: 0,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 1.1,
        anchor: 'attacker',
        offsetY: -62,
        cameraShake: 1.4,
        cameraZoom: 0.012,
      },
      {
        frame: 3,
        effectPreset: 'swing_arc_special',
        effectLayer: 'front',
        effectScale: 1.16,
        anchor: 'strike',
        cameraShake: 3.6,
        cameraZoom: 0.02,
        cameraTtl: 8,
      },
      {
        frame: 8,
        effectPreset: 'special_sigils',
        effectLayer: 'behind',
        effectScale: 1.05,
        anchor: 'attacker',
        offsetY: -54,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      startupShift: 0.05,
      activeShift: 0.05,
      recoveryShift: 0.05,
      reachJitter: 0.06,
      leanJitter: 0.05,
      twistJitter: 0.05,
      cadenceJitter: 0.08,
    },
  },
  counter_riposte: {
    choreography: 'riposte',
    cues: [
      {
        frame: 0,
        effectPreset: 'startup_flash',
        effectLayer: 'front',
        effectScale: 0.94,
        anchor: 'attacker',
        offsetY: -50,
      },
      {
        frame: 2,
        effectPreset: 'swing_arc_special',
        effectLayer: 'front',
        effectScale: 1.1,
        anchor: 'strike',
        cameraShake: 2.8,
        cameraZoom: 0.016,
      },
      {
        frame: 6,
        effectPreset: 'recovery_echo',
        effectLayer: 'behind',
        effectScale: 0.94,
        anchor: 'attacker',
        offsetY: -40,
      },
    ],
    microTiming: {
      ...DEFAULT_MICRO_TIMING,
      startupShift: 0.07,
      activeShift: 0.04,
      recoveryShift: 0.04,
      reachJitter: 0.05,
      leanJitter: 0.05,
      twistJitter: 0.06,
      cadenceJitter: 0.07,
    },
  },
};

const DEFAULT_PRESET_BY_ATTACK_TYPE = {
  light: 'jab_snap',
  medium: 'rebel_wave',
  heavy: 'launcher_crack',
  special: 'special_invocation',
} satisfies Record<AttackData['type'], AttackPresentationPresetId>;

function pseudo(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function range(seed: number, amount: number): number {
  return (pseudo(seed) * 2 - 1) * amount;
}

export function resolveAttackPresentationProfile(attack: AttackData): AttackPresentationProfile {
  const presetId = attack.presentationPreset ?? DEFAULT_PRESET_BY_ATTACK_TYPE[attack.type];
  return PRESENTATION_PRESETS[presetId];
}

export function createAttackMotionVariation(
  attack: AttackData,
  characterSeed: number,
  counter: number
): AttackMotionVariation {
  const profile = resolveAttackPresentationProfile(attack).microTiming;
  const baseSeed = characterSeed * 97 + counter * 31 + attack.startup * 5 + attack.active * 7;

  return {
    startupShift: range(baseSeed + 1, profile.startupShift),
    activeShift: range(baseSeed + 2, profile.activeShift),
    recoveryShift: range(baseSeed + 3, profile.recoveryShift),
    reachJitter: range(baseSeed + 4, profile.reachJitter),
    leanJitter: range(baseSeed + 5, profile.leanJitter),
    twistJitter: range(baseSeed + 6, profile.twistJitter),
    cadenceJitter: range(baseSeed + 7, profile.cadenceJitter),
  };
}

function createVisualEffectId(
  fighterId: string,
  currentFrame: number,
  cue: AttackPresentationCue
): string {
  return `cue_${fighterId}_${currentFrame}_${cue.frame}_${cue.effectPreset ?? 'camera'}`;
}

function getCuePosition(
  fighter: Fighter,
  attack: AttackData,
  anchor: AttackPresentationCue['anchor']
): { x: number; y: number; lane: Lane } {
  const facing = fighter.attackFacing ?? fighter.facing;
  const direction = facing === 'right' ? 1 : -1;

  if (anchor === 'strike') {
    return {
      x: fighter.x + direction * Math.max(18, attack.range * 0.55),
      y: fighter.getWorldY() - 48,
      lane: fighter.lane,
    };
  }

  return {
    x: fighter.x,
    y: fighter.getWorldY() - 48,
    lane: fighter.lane,
  };
}

export function createPresentationVisualEffect(
  fighter: Fighter,
  attack: AttackData,
  cue: AttackPresentationCue,
  currentFrame: number
): FightVisualEffect | null {
  if (!cue.effectPreset) {
    return null;
  }

  const position = getCuePosition(fighter, attack, cue.anchor);

  return {
    id: createVisualEffectId(fighter.id, currentFrame, cue),
    preset: cue.effectPreset,
    lane: position.lane,
    x: position.x + (cue.offsetX ?? 0),
    y: position.y + (cue.offsetY ?? 0),
    ttl: cue.effectTtl ?? 8,
    totalTtl: cue.effectTtl ?? 8,
    scale: cue.effectScale ?? 1,
    color: cue.effectColor ?? fighter.character.colors.accent,
    layer: cue.effectLayer ?? 'front',
  };
}

export function createPresentationCameraEffect(
  fighter: Fighter,
  cue: AttackPresentationCue,
  currentFrame: number
): FightCameraEffect | null {
  if (!cue.cameraShake && !cue.cameraZoom) {
    return null;
  }

  return {
    id: createVisualEffectId(fighter.id, currentFrame, cue),
    ttl: cue.cameraTtl ?? 6,
    totalTtl: cue.cameraTtl ?? 6,
    shake: cue.cameraShake ?? 0,
    zoomDelta: cue.cameraZoom ?? 0,
  };
}

export function stepFightCameraEffects(effects: FightCameraEffect[]): FightCameraEffect[] {
  return effects
    .map((effect) => {
      const ttl = effect.ttl - 1;
      if (ttl <= 0) {
        return null;
      }

      return {
        ...effect,
        ttl,
      };
    })
    .filter((effect): effect is FightCameraEffect => effect !== null);
}
