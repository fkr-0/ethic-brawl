/**
 * Global game configuration constants
 */

/**
 * Canvas dimensions
 */
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

/**
 * Target frame rate
 */
export const TARGET_FPS = 60;

/**
 * Fixed timestep in milliseconds
 */
export const FIXED_TIMESTEP = 1000 / TARGET_FPS;

/**
 * Lane configuration
 */
export const LANE_COUNT = 3;
export const LANE_SPACING = 50;
export const LANE_Y_POSITIONS: readonly [number, number, number] = [
  CANVAS_HEIGHT - 120, // Front (closest to camera)
  CANVAS_HEIGHT - 170, // Middle
  CANVAS_HEIGHT - 220, // Back (farthest from camera)
];

/**
 * Physics configuration
 */
export const GRAVITY = 0.6;
export const GROUND_Y = CANVAS_HEIGHT - 100;

/**
 * Fighter configuration
 */
export const FIGHTER_WIDTH = 60;
export const FIGHTER_HEIGHT = 80;

/**
 * Combat configuration
 */
export const WALK_SPEED = 4;
export const RUN_SPEED = 7;
export const JUMP_VELOCITY = 14;
export const AIR_CONTROL = 0.4;

/**
 * Attack frame data
 */
export const ATTACK_STARTUP = 8;
export const ATTACK_ACTIVE = 6;
export const ATTACK_RECOVERY = 15;
export const ATTACK_RANGE = 70;

/**
 * Block configuration
 */
export const BLOCK_DAMAGE_REDUCTION = 0.6;
export const PERFECT_BLOCK_WINDOW = 8; // frames
export const RIPOSTE_ADVANTAGE = 30; // frames

/**
 * Roll configuration
 */
export const ROLL_DURATION = 20;
export const ROLL_INVULN_START = 5;
export const ROLL_INVULN_END = 17;
export const ROLL_COOLDOWN = 60;

/**
 * Combo configuration
 */
export const COMBO_WINDOW = 30; // frames to continue combo
export const COMBO_BREAK_GROUND_FRAMES = 45; // frames on ground to break combo

/**
 * Round configuration
 */
export const ROUNDS_TO_WIN = 2;
export const ROUND_TIME = 99; // seconds

/**
 * Audio configuration
 */
export const AUDIO_LATENCY_CALIBRATION = 0; // milliseconds, user can adjust

/**
 * UI animation timings
 */
export const INTRO_DURATION = 3000; // ms
export const VICTORY_DURATION = 4000; // ms
export const SCREEN_TRANSITION_DURATION = 500; // ms

/**
 * Persistence keys
 */
export const STORAGE_KEYS = {
  SETTINGS: 'ethic_brawl_settings',
  PROGRESS: 'ethic_brawl_progress',
  BEST_SCORES: 'ethic_brawl_best_scores',
} as const;

/**
 * Default game settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  audioLatencyCalibration: AUDIO_LATENCY_CALIBRATION,
  screenShake: true,
  showHitboxes: false,
};

/**
 * Game settings interface
 */
export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  audioLatencyCalibration: number;
  screenShake: boolean;
  showHitboxes: boolean;
}
