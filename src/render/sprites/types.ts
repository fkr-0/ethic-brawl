/**
 * Sprite system type definitions
 */

/**
 * Frame label for identifying animation frames
 */
export type FrameLabel =
  | 'idle'
  | 'guard'
  | 'taunt_or_pose'
  | 'run_1'
  | 'run_2'
  | 'run_3'
  | 'run_4'
  | 'crouch'
  | 'jump_rise'
  | 'air_attack_or_air_kick'
  | 'land'
  | 'attack_1'
  | 'attack_2'
  | 'attack_3'
  | 'victory_or_quote_pose'
  | 'spare';

/**
 * Fighter state name for clip mapping
 */
export type FighterStateName =
  | 'idle'
  | 'walking'
  | 'running'
  | 'jumping'
  | 'falling'
  | 'landing'
  | 'crouching'
  | 'blocking'
  | 'attacking'
  | 'special'
  | 'hitstun'
  | 'knockdown'
  | 'gettingUp'
  | 'victory'
  | 'defeat';

/**
 * Attack phase for clip mapping
 */
export type AttackPhase = 'startup' | 'active' | 'recovery';

/**
 * Clip playback mode
 */
export type ClipPlaybackMode = 'once' | 'loop' | 'pingpong';

/**
 * Pivot point for sprite frame
 */
export interface PivotPoint {
  x: number;
  y: number;
}

/**
 * Frame metadata
 */
export interface FrameMetadata {
  index: number;
  label: FrameLabel;
  pivot: PivotPoint;
  duration?: number;
}

/**
 * Clip frame definition
 */
export interface ClipFrame {
  frameIndex: number;
  duration: number;
}

/**
 * Animation clip definition
 */
export interface AnimationClip {
  id: string;
  name: string;
  frames: ClipFrame[];
  mode: ClipPlaybackMode;
}

/**
 * State-to-clip mapping
 */
export interface StateClipMapping {
  state: FighterStateName;
  clipId: string;
  speed?: number;
}

/**
 * Attack phase clip mapping
 */
export interface AttackPhaseMapping {
  attackId: string;
  phase: AttackPhase;
  clipId: string;
  speed?: number;
}

/**
 * Command special clip mapping
 */
export interface CommandSpecialMapping {
  command: string;
  clipId: string;
  speed?: number;
}

/**
 * Per-character sprite manifest
 */
export interface SpriteManifest {
  characterId: string;
  frames: FrameMetadata[];
  clips: AnimationClip[];
  stateMappings: StateClipMapping[];
  attackPhaseMappings: AttackPhaseMapping[];
  commandSpecialMappings?: CommandSpecialMapping[];
  fallbackClip?: string;
}

/**
 * Atlas frame definition
 */
export interface AtlasFrame {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  pivot: PivotPoint;
}

/**
 * Character sprite atlas
 */
export interface SpriteAtlas {
  characterId: string;
  image: HTMLImageElement | HTMLCanvasElement;
  frames: AtlasFrame[];
  frameWidth: number;
  frameHeight: number;
}

/**
 * Animation player state
 */
export interface AnimationPlayerState {
  currentClip: AnimationClip | null;
  currentFrame: number;
  frameTimer: number;
  isPlaying: boolean;
  isPaused: boolean;
  playbackSpeed: number;
  direction: 1 | -1;
}

/**
 * Sprite render options
 */
export interface SpriteRenderOptions {
  flipX: boolean;
  opacity: number;
  scale: number;
  tint?: string;
}

/**
 * Character animation map
 */
export interface CharacterAnimationMap {
  characterId: string;
  manifest: SpriteManifest;
  atlas: SpriteAtlas | null;
  stateToClip: Map<FighterStateName, AnimationClip>;
  attackPhaseToClip: Map<string, Map<AttackPhase, AnimationClip>>;
  commandSpecialToClip: Map<string, AnimationClip>;
  fallbackClip: AnimationClip | null;
}
