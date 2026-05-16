/**
 * Fighter state definitions and types
 */

/**
 * All possible fighter states
 */
export type FighterStateName =
  | 'idle'
  | 'walking'
  | 'running'
  | 'jumping'
  | 'falling'
  | 'attacking'
  | 'blocking'
  | 'hitstun'
  | 'knockdown'
  | 'gettingUp'
  | 'victory'
  | 'defeat'
  | 'special';

/**
 * Fighter direction
 */
export type Direction = 'left' | 'right';

/**
 * Lane position (0 = front, 1 = middle, 2 = back)
 */
export type Lane = 0 | 1 | 2;

/**
 * Attack types
 */
export type AttackType = 'light' | 'medium' | 'heavy' | 'special';

import type { AttackPresentationPresetId } from './attack-presentation-presets';
import type { AttackHitPolicy, AttackHitPolicyPresetId } from './hit-policy-presets';
import type { AttackMoveClass, AttackMoveClassPresetId } from './move-class-presets';

/**
 * Attack data structure
 */
export interface AttackData {
  id: string;
  name: string;
  damage: number;
  hitstun: number;
  knockbackX: number;
  knockbackY: number;
  range: number;
  startup: number;
  active: number;
  recovery: number;
  type: AttackType;
  hitPolicy?: AttackHitPolicy;
  hitPolicyPreset?: AttackHitPolicyPresetId;
  moveClass?: AttackMoveClass;
  moveClassPreset?: AttackMoveClassPresetId;
  presentationPreset?: AttackPresentationPresetId;
  hitbox?: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
}

/**
 * Fighter stats
 */
export interface FighterStats {
  health: number;
  maxHealth: number;
  strength: number;
  defense: number;
  intelligence: number;
  agility: number;
  vitality: number;
  energy: number;
}

export const DEFAULT_FIGHTER_STATS: FighterStats = {
  health: 100,
  maxHealth: 100,
  strength: 5,
  defense: 5,
  intelligence: 5,
  agility: 5,
  vitality: 5,
  energy: 5,
};

/**
 * State transition rules
 */
export const STATE_TRANSITIONS: Record<FighterStateName, FighterStateName[]> = {
  idle: [
    'walking',
    'running',
    'jumping',
    'attacking',
    'blocking',
    'hitstun',
    'special',
    'victory',
    'defeat',
  ],
  walking: ['idle', 'running', 'jumping', 'attacking', 'blocking', 'hitstun', 'special'],
  running: ['idle', 'walking', 'jumping', 'attacking', 'blocking', 'hitstun', 'special'],
  jumping: ['falling', 'attacking', 'hitstun', 'special'],
  falling: ['idle', 'walking', 'hitstun', 'knockdown'],
  attacking: ['idle', 'walking', 'hitstun', 'knockdown'],
  blocking: ['idle', 'walking', 'hitstun'],
  hitstun: ['idle', 'knockdown', 'hitstun'],
  knockdown: ['gettingUp', 'victory', 'defeat'],
  gettingUp: ['idle', 'blocking'],
  victory: [],
  defeat: [],
  special: ['idle', 'walking', 'hitstun', 'knockdown'],
};

/**
 * Default attack chain data
 */
export const DEFAULT_ATTACK_CHAIN: AttackData[] = [
  {
    id: 'attack_1',
    name: 'Jab',
    damage: 8,
    hitstun: 12,
    knockbackX: 2,
    knockbackY: 0,
    range: 60,
    startup: 6,
    active: 4,
    recovery: 12,
    type: 'light',
  },
  {
    id: 'attack_2',
    name: 'Straight',
    damage: 10,
    hitstun: 14,
    knockbackX: 3,
    knockbackY: 0,
    range: 65,
    startup: 7,
    active: 5,
    recovery: 14,
    type: 'medium',
  },
  {
    id: 'attack_3',
    name: 'Hook',
    damage: 15,
    hitstun: 20,
    knockbackX: 6,
    knockbackY: 2,
    range: 55,
    startup: 8,
    active: 6,
    recovery: 18,
    type: 'heavy',
  },
];

/**
 * Frame data constants
 */
export const FRAME_DATA = {
  // Movement
  WALK_SPEED: 4,
  RUN_SPEED: 7,
  RUN_ACCELERATION: 0.5,
  RUN_DECELERATION: 0.8,

  // Jump
  JUMP_VELOCITY: 14,
  GRAVITY: 0.6,
  AIR_CONTROL: 0.4,

  // Lane
  LANE_CHANGE_DURATION: 15,

  // Block
  BLOCK_DAMAGE_REDUCTION: 0.6,
  PERFECT_BLOCK_WINDOW: 3,
  RIPOSTE_ADVANTAGE: 30,
  CHIP_DAMAGE_RATIO: 0.1,

  // Roll
  ROLL_DURATION: 20,
  ROLL_INVULN_START: 5,
  ROLL_INVULN_END: 17,
  ROLL_COOLDOWN: 60,

  // Combo
  COMBO_WINDOW: 30,
  COMBO_BREAK_GROUND_FRAMES: 45,

  // Input timing
  RUN_DOUBLE_TAP_WINDOW: 18,

  // Recovery
  KNOCKDOWN_DURATION: 45,
  GET_UP_DURATION: 20,

  // Animation
  LANDING_IMPACT_DURATION: 8,
  TURNAROUND_DURATION: 10,
  RECOIL_DURATION: 12,
} as const;
