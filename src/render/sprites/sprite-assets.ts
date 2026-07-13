/**
 * Sprite asset loader and cache
 */

import type {
  AnimationClip,
  AtlasFrame,
  ClipFrame,
  FrameMetadata,
  PivotPoint,
  SpriteAtlas,
  SpriteManifest,
} from './types';

/**
 * Default frame dimensions for 4x4 sprite sheets
 */
const DEFAULT_FRAME_WIDTH = 64;
const DEFAULT_FRAME_HEIGHT = 64;

/**
 * Default pivot points (bottom-center for grounded characters)
 */
const DEFAULT_PIVOT: PivotPoint = { x: 0.5, y: 1 };

/**
 * In-memory cache for loaded atlases
 */
const atlasCache = new Map<string, SpriteAtlas>();

/**
 * In-memory cache for loaded manifests
 */
const manifestCache = new Map<string, SpriteManifest>();

/**
 * Calculate frame index from 4x4 sheet coordinates
 */
export function frameIndexFrom4x4(row: number, col: number): number {
  return row * 4 + col;
}

/**
 * Calculate 4x4 sheet coordinates from frame index
 */
export function frameIndexTo4x4(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 4),
    col: index % 4,
  };
}

/**
 * Create default frame metadata for 16 frames
 */
export function createDefaultFrameMetadata(): FrameMetadata[] {
  const labels = [
    'idle',
    'guard',
    'guard',
    'taunt_or_pose',
    'run_1',
    'run_2',
    'run_3',
    'run_4',
    'crouch',
    'jump_rise',
    'air_attack_or_air_kick',
    'land',
    'attack_1',
    'attack_2',
    'attack_3',
    'victory_or_quote_pose',
  ] as const;

  return labels.map((label, index) => ({
    index,
    label,
    pivot: { ...DEFAULT_PIVOT },
    duration: 4,
  }));
}

/**
 * Create a single-frame clip
 */
export function createSingleFrameClip(
  id: string,
  name: string,
  frameIndex: number,
  duration = 4
): AnimationClip {
  return {
    id,
    name,
    frames: [{ frameIndex, duration }],
    mode: 'loop',
  };
}

/**
 * Create a multi-frame clip from frame indices
 */
export function createClip(
  id: string,
  name: string,
  frameIndices: number[],
  mode: 'once' | 'loop' | 'pingpong' = 'once',
  durationPerFrame = 4
): AnimationClip {
  const frames: ClipFrame[] = frameIndices.map((frameIndex) => ({
    frameIndex,
    duration: durationPerFrame,
  }));

  return {
    id,
    name,
    frames,
    mode,
  };
}

/**
 * Create default animation clips for a character
 */
export function createDefaultClips(): AnimationClip[] {
  return [
    createClip('idle', 'Idle', [0], 'loop', 8),
    createSingleFrameClip('guard', 'Guard', 1, 1),
    createClip('run', 'Run', [4, 5, 6, 7], 'loop', 3),
    createSingleFrameClip('crouch', 'Crouch / Landing', 8, 1),
    createClip('jump_rise', 'Jump Rise', [9], 'loop', 6),
    createSingleFrameClip('air_attack', 'Air Attack', 10, 1),
    createSingleFrameClip('land', 'Land', 11, 1),
    createClip('attack_1', 'Attack 1', [12], 'loop', 4),
    createClip('attack_2', 'Attack 2', [13], 'loop', 4),
    createClip('attack_3', 'Attack 3', [14], 'loop', 4),
    createClip('special', 'Special', [15], 'loop', 5),
    createClip('victory', 'Victory / Gesture', [3], 'loop', 8),
    createSingleFrameClip('spare', 'Spare', 2, 1),
  ];
}

/**
 * Create exact atlas frames from an evenly divided sprite grid.
 *
 * The source sheets are not always exactly divisible by four (several are
 * 512x546), so each edge is derived independently instead of accumulating a
 * rounded frame stride. This prevents later rows and columns from drifting.
 */
export function createAtlasFramesFromGrid(
  image: HTMLImageElement | HTMLCanvasElement,
  rows: number,
  columns: number,
  options: {
    indexOffset?: number;
    destinationOffsetX?: number;
    destinationOffsetY?: number;
    cropPixels?: number;
  } = {}
): AtlasFrame[] {
  const {
    indexOffset = 0,
    destinationOffsetX = 0,
    destinationOffsetY = 0,
    cropPixels = 0,
  } = options;
  const frames: AtlasFrame[] = [];

  for (let row = 0; row < rows; row++) {
    const sourceTop = Math.floor((row * image.height) / rows);
    const sourceBottom = Math.floor(((row + 1) * image.height) / rows);
    for (let col = 0; col < columns; col++) {
      const sourceLeft = Math.floor((col * image.width) / columns);
      const sourceRight = Math.floor(((col + 1) * image.width) / columns);
      const insetLeft = Math.floor(cropPixels / 2);
      const insetTop = Math.floor(cropPixels / 2);
      const width = Math.max(1, sourceRight - sourceLeft - cropPixels);
      const height = Math.max(1, sourceBottom - sourceTop - cropPixels);

      frames.push({
        index: indexOffset + row * columns + col,
        x: destinationOffsetX + sourceLeft + insetLeft,
        y: destinationOffsetY + sourceTop + insetTop,
        width,
        height,
        frameWidth: width,
        frameHeight: height,
        pivot: { ...DEFAULT_PIVOT },
      });
    }
  }

  return frames;
}

/**
 * Load an image from a URL
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Verify the image actually loaded by checking dimensions
      if (img.width === 0 || img.height === 0) {
        reject(new Error(`Image loaded but has zero dimensions: ${src}`));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Create atlas frames from a 4x4 sprite sheet
 */
export function createAtlasFrom4x4Sheet(
  _image: HTMLImageElement | HTMLCanvasElement,
  frameWidth: number = DEFAULT_FRAME_WIDTH,
  frameHeight: number = DEFAULT_FRAME_HEIGHT,
  pivots?: PivotPoint[],
  gridOffsetX = 0,
  gridOffsetY = 0
): AtlasFrame[] {
  const frames: AtlasFrame[] = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const index = frameIndexFrom4x4(row, col);
      frames.push({
        index,
        x: gridOffsetX + col * frameWidth,
        y: gridOffsetY + row * frameHeight,
        width: frameWidth,
        height: frameHeight,
        frameWidth,
        frameHeight,
        pivot: pivots?.[index] ?? DEFAULT_PIVOT,
      });
    }
  }

  return frames;
}

/**
 * Build a sprite atlas from a 4x4 sheet image
 */
export async function buildAtlasFrom4x4Sheet(
  characterId: string,
  imageSrc: string,
  frameWidth: number = DEFAULT_FRAME_WIDTH,
  frameHeight: number = DEFAULT_FRAME_HEIGHT,
  pivots?: PivotPoint[]
): Promise<SpriteAtlas> {
  const cacheKey = `${characterId}_${frameWidth}x${frameHeight}`;

  const cached = atlasCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const image = await loadImage(imageSrc);
  const frames = createAtlasFrom4x4Sheet(image, frameWidth, frameHeight, pivots);

  const atlas: SpriteAtlas = {
    characterId,
    image,
    frames,
    frameWidth,
    frameHeight,
  };

  atlasCache.set(cacheKey, atlas);
  return atlas;
}

/**
 * Create a default sprite manifest
 */
export function createDefaultManifest(characterId: string): SpriteManifest {
  const clips = createDefaultClips();

  return {
    characterId,
    frames: createDefaultFrameMetadata(),
    clips,
    stateMappings: [
      { state: 'idle', clipId: 'idle' },
      { state: 'walking', clipId: 'run' },
      { state: 'running', clipId: 'run' },
      { state: 'jumping', clipId: 'jump_rise' },
      { state: 'falling', clipId: 'jump_rise' },
      { state: 'landing', clipId: 'land' },
      { state: 'crouching', clipId: 'crouch' },
      { state: 'blocking', clipId: 'guard' },
      { state: 'attacking', clipId: 'attack_1' },
      { state: 'special', clipId: 'special' },
      { state: 'hitstun', clipId: 'idle' },
      { state: 'knockdown', clipId: 'land' },
      { state: 'gettingUp', clipId: 'land' },
      { state: 'victory', clipId: 'victory' },
      { state: 'defeat', clipId: 'land' },
    ],
    attackPhaseMappings: [
      { attackId: '*', phase: 'startup', clipId: 'attack_1' },
      { attackId: '*', phase: 'active', clipId: 'attack_2' },
      { attackId: '*', phase: 'recovery', clipId: 'attack_3' },
    ],
    fallbackClip: 'idle',
  };
}

/**
 * Split a 4x4 sprite sheet into individual frame metadata
 */
export function split4x4Sheet(
  _characterId: string,
  _frameWidth: number = DEFAULT_FRAME_WIDTH,
  _frameHeight: number = DEFAULT_FRAME_HEIGHT,
  _customPivots?: Partial<Record<number, PivotPoint>>
): FrameMetadata[] {
  return createDefaultFrameMetadata();
}

/**
 * Load a sprite manifest from metadata
 */
export function loadManifest(
  metadata: Partial<SpriteManifest> & { characterId: string }
): SpriteManifest {
  const cacheKey = metadata.characterId;

  const cached = manifestCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const manifest: SpriteManifest = {
    ...createDefaultManifest(metadata.characterId),
    ...metadata,
  };

  manifestCache.set(cacheKey, manifest);
  return manifest;
}

/**
 * Get atlas from cache
 */
export function getAtlas(characterId: string): SpriteAtlas | null {
  return atlasCache.get(characterId) ?? null;
}

/**
 * Get manifest from cache
 */
export function getManifest(characterId: string): SpriteManifest | null {
  return manifestCache.get(characterId) ?? null;
}

/**
 * Clear all caches
 */
export function clearSpriteCache(): void {
  atlasCache.clear();
  manifestCache.clear();
}
