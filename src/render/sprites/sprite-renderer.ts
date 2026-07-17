/**
 * Sprite renderer for fighter sprites
 */

import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import { markSpriteFallback, shouldUseSpriteFallback } from './sprite-fallback';
import type {
  AnimationClip,
  AtlasFrame,
  CharacterAnimationMap,
  ClipFrame,
  SpriteAtlas,
  SpriteRenderOptions,
} from './types';

/**
 * Chroma key settings for removing sprite backgrounds
 */
export type ChromaKeyMode = 'adaptive-edge' | 'fixed-color';

export interface ChromaKeySettings {
  enabled: boolean;
  mode: ChromaKeyMode;
  threshold: number;
  r: number;
  g: number;
  b: number;
}

export interface SpriteFrameInspection {
  frameIndex: number;
  width: number;
  height: number;
  opaqueCoverage: number;
  topAndSideEdgeCoverage: number;
  boundsValid: boolean;
  blank: boolean;
  backgroundLeak: boolean;
}

let chromaKeySettings: ChromaKeySettings = {
  enabled: true,
  mode: 'adaptive-edge',
  threshold: 46,
  r: 255,
  g: 255,
  b: 255,
};

const PLAYABLE_CHARACTER_IDS = new Set<string>(getCharacterIds());

function isPlayableCharacterId(characterId: string): characterId is CharacterId {
  return PLAYABLE_CHARACTER_IDS.has(characterId);
}

export function setChromaKey(
  enabled: boolean,
  r = 255,
  g = 255,
  b = 255,
  threshold = 46,
  mode: ChromaKeyMode = 'adaptive-edge'
): void {
  chromaKeySettings = { enabled, mode, r, g, b, threshold };
  chromaKeyCanvasCache.clear();
  processedChromaKeyFrames.clear();
  console.info(
    `🎨 Chroma key ${enabled ? 'enabled' : 'disabled'}: ${mode}, RGB(${r}, ${g}, ${b}), threshold ${threshold}`
  );
}

export function getChromaKeySettings(): ChromaKeySettings {
  return chromaKeySettings;
}

/**
 * Default render options
 */
const DEFAULT_RENDER_OPTIONS: SpriteRenderOptions = {
  flipX: false,
  opacity: 1,
  scale: 1,
};

/**
 * Create render options with defaults
 */
export function createRenderOptions(
  options: Partial<SpriteRenderOptions> = {}
): SpriteRenderOptions {
  return {
    ...DEFAULT_RENDER_OPTIONS,
    ...options,
  };
}

/**
 * Get atlas frame from clip frame
 */
export function getAtlasFrame(
  animMap: CharacterAnimationMap,
  clipFrame: ClipFrame
): AtlasFrame | null {
  if (!animMap.atlas) {
    return null;
  }

  return animMap.atlas.frames[clipFrame.frameIndex] ?? null;
}

/**
 * Calculate render position from pivot point
 */
export function calculatePivotOffset(
  atlasFrame: AtlasFrame,
  scale: number
): { x: number; y: number } {
  return {
    x: -atlasFrame.frameWidth * atlasFrame.pivot.x * scale,
    y: -atlasFrame.frameHeight * atlasFrame.pivot.y * scale,
  };
}

/**
 * Apply a fixed chroma key to every matching pixel.
 */
function applyFixedChromaKey(imageData: ImageData, settings: ChromaKeySettings): void {
  const data = imageData.data;
  const { r, g, b, threshold } = settings;

  for (let i = 0; i < data.length; i += 4) {
    const pixelR = data[i] ?? 0;
    const pixelG = data[i + 1] ?? 0;
    const pixelB = data[i + 2] ?? 0;
    const distance = Math.hypot(pixelR - r, pixelG - g, pixelB - b);
    if (distance < threshold) data[i + 3] = 0;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)] ?? 0;
}

/**
 * Remove only edge-connected background pixels. Each scanline derives its
 * background colour from both side margins, which handles the white legacy
 * sheets as well as the dark vertical gradients used by newer roster sheets
 * without erasing light clothing or dark interior line work.
 */
function applyAdaptiveEdgeKey(imageData: ImageData, settings: ChromaKeySettings): void {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const borderSampleWidth = Math.min(5, Math.max(1, Math.floor(width / 8)));
  const rowBackground = new Uint8ClampedArray(height * 3);

  for (let y = 0; y < height; y += 1) {
    const channels: [number[], number[], number[]] = [[], [], []];
    for (let sample = 0; sample < borderSampleWidth; sample += 1) {
      for (const x of [sample, width - 1 - sample]) {
        const offset = (y * width + x) * 4;
        const alpha = data[offset + 3] ?? 0;
        if (alpha <= 16) continue;
        channels[0].push(data[offset] ?? settings.r);
        channels[1].push(data[offset + 1] ?? settings.g);
        channels[2].push(data[offset + 2] ?? settings.b);
      }
    }
    const rowOffset = y * 3;
    rowBackground[rowOffset] = channels[0].length > 0 ? median(channels[0]) : settings.r;
    rowBackground[rowOffset + 1] = channels[1].length > 0 ? median(channels[1]) : settings.g;
    rowBackground[rowOffset + 2] = channels[2].length > 0 ? median(channels[2]) : settings.b;
  }

  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let queueStart = 0;
  let queueEnd = 0;

  const isBackgroundCandidate = (pixelIndex: number, previousPixelIndex = -1): boolean => {
    const offset = pixelIndex * 4;
    const alpha = data[offset + 3] ?? 0;
    if (alpha <= 16) return true;

    const y = Math.floor(pixelIndex / width);
    const rowOffset = y * 3;
    const r = data[offset] ?? 0;
    const g = data[offset + 1] ?? 0;
    const b = data[offset + 2] ?? 0;
    const rowDistance = Math.hypot(
      r - (rowBackground[rowOffset] ?? settings.r),
      g - (rowBackground[rowOffset + 1] ?? settings.g),
      b - (rowBackground[rowOffset + 2] ?? settings.b)
    );
    if (rowDistance <= settings.threshold) return true;

    if (previousPixelIndex >= 0 && rowDistance <= settings.threshold * 1.75) {
      const previousOffset = previousPixelIndex * 4;
      const localDistance = Math.hypot(
        r - (data[previousOffset] ?? r),
        g - (data[previousOffset + 1] ?? g),
        b - (data[previousOffset + 2] ?? b)
      );
      return localDistance <= 18;
    }
    return false;
  };

  const enqueue = (pixelIndex: number, previousPixelIndex = -1): void => {
    if (pixelIndex < 0 || pixelIndex >= pixelCount || visited[pixelIndex] === 1) return;
    if (!isBackgroundCandidate(pixelIndex, previousPixelIndex)) return;
    visited[pixelIndex] = 1;
    queue[queueEnd++] = pixelIndex;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart++] ?? 0;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) enqueue(pixelIndex - 1, pixelIndex);
    if (x + 1 < width) enqueue(pixelIndex + 1, pixelIndex);
    if (y > 0) enqueue(pixelIndex - width, pixelIndex);
    if (y + 1 < height) enqueue(pixelIndex + width, pixelIndex);
  }

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    if (visited[pixelIndex] === 1) data[pixelIndex * 4 + 3] = 0;
  }
}

export function applySpriteBackgroundKey(
  imageData: ImageData,
  settings: ChromaKeySettings = chromaKeySettings
): void {
  if (!settings.enabled) return;
  if (settings.mode === 'fixed-color') applyFixedChromaKey(imageData, settings);
  else applyAdaptiveEdgeKey(imageData, settings);
}

/**
 * Get or create an offscreen canvas for chroma key processing
 */
const chromaKeyCanvasCache = new Map<string, HTMLCanvasElement>();
const processedChromaKeyFrames = new Set<string>();

/**
 * Debug mode for showing frame boundaries
 */
let debugShowFrameBoundaries = false;

export function setDebugFrameBoundaries(enabled: boolean): void {
  debugShowFrameBoundaries = enabled;
  console.info(`🔍 Debug frame boundaries ${enabled ? 'enabled' : 'disabled'}`);
}

function getChromaKeyCanvas(key: string, width: number, height: number): HTMLCanvasElement {
  let canvas = chromaKeyCanvasCache.get(key);
  if (!canvas || canvas.width !== width || canvas.height !== height) {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    chromaKeyCanvasCache.set(key, canvas);
    processedChromaKeyFrames.delete(key);
  }
  return canvas;
}

export function getProcessedSpriteFrameCanvas(
  atlas: SpriteAtlas,
  atlasFrame: AtlasFrame
): HTMLCanvasElement | null {
  if (!atlas.image || atlas.image.width === 0 || atlas.image.height === 0) return null;

  const cacheKey = `${atlas.characterId}_${atlasFrame.index}`;
  const canvas = getChromaKeyCanvas(cacheKey, atlasFrame.frameWidth, atlasFrame.frameHeight);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  if (!processedChromaKeyFrames.has(cacheKey)) {
    context.clearRect(0, 0, atlasFrame.frameWidth, atlasFrame.frameHeight);
    context.drawImage(
      atlas.image,
      atlasFrame.x,
      atlasFrame.y,
      atlasFrame.frameWidth,
      atlasFrame.frameHeight,
      0,
      0,
      atlasFrame.frameWidth,
      atlasFrame.frameHeight
    );

    if (chromaKeySettings.enabled) {
      const imageData = context.getImageData(0, 0, atlasFrame.frameWidth, atlasFrame.frameHeight);
      applySpriteBackgroundKey(imageData, chromaKeySettings);
      context.putImageData(imageData, 0, 0);
    }
    processedChromaKeyFrames.add(cacheKey);
  }

  return canvas;
}

export function inspectSpriteFrame(
  atlas: SpriteAtlas,
  atlasFrame: AtlasFrame
): SpriteFrameInspection {
  const boundsValid =
    atlasFrame.x >= 0 &&
    atlasFrame.y >= 0 &&
    atlasFrame.frameWidth > 0 &&
    atlasFrame.frameHeight > 0 &&
    atlasFrame.x + atlasFrame.frameWidth <= atlas.image.width &&
    atlasFrame.y + atlasFrame.frameHeight <= atlas.image.height;
  const canvas = boundsValid ? getProcessedSpriteFrameCanvas(atlas, atlasFrame) : null;
  const context = canvas?.getContext('2d', { willReadFrequently: true }) ?? null;
  if (!canvas || !context) {
    return {
      frameIndex: atlasFrame.index,
      width: atlasFrame.frameWidth,
      height: atlasFrame.frameHeight,
      opaqueCoverage: 0,
      topAndSideEdgeCoverage: 0,
      boundsValid,
      blank: true,
      backgroundLeak: false,
    };
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  let opaquePixels = 0;
  let edgePixels = 0;
  let opaqueEdgePixels = 0;
  const edgeWidth = Math.min(2, Math.max(1, Math.floor(Math.min(width, height) / 16)));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3] ?? 0;
      if (alpha > 16) opaquePixels += 1;
      const onTopOrSide = y < edgeWidth || x < edgeWidth || x >= width - edgeWidth;
      if (onTopOrSide) {
        edgePixels += 1;
        if (alpha > 16) opaqueEdgePixels += 1;
      }
    }
  }

  const opaqueCoverage = opaquePixels / Math.max(1, width * height);
  const topAndSideEdgeCoverage = opaqueEdgePixels / Math.max(1, edgePixels);
  return {
    frameIndex: atlasFrame.index,
    width,
    height,
    opaqueCoverage,
    topAndSideEdgeCoverage,
    boundsValid,
    blank: opaqueCoverage < 0.01,
    backgroundLeak: opaqueCoverage > 0.72 || topAndSideEdgeCoverage > 0.58,
  };
}

/**
 * Render a single sprite frame
 */
export function renderSpriteFrame(
  ctx: CanvasRenderingContext2D,
  atlas: SpriteAtlas,
  atlasFrame: AtlasFrame,
  x: number,
  y: number,
  options: SpriteRenderOptions = DEFAULT_RENDER_OPTIONS
): boolean {
  // Check if the image is valid before attempting to render
  if (!atlas.image || atlas.image.width === 0 || atlas.image.height === 0) {
    return false;
  }

  const opts = createRenderOptions(options);
  const { scale, flipX, opacity } = opts;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);

  if (flipX) {
    ctx.scale(-1, 1);
  }

  ctx.scale(scale, scale);

  const pivotOffset = calculatePivotOffset(atlasFrame, 1);
  ctx.translate(pivotOffset.x, pivotOffset.y);

  const processedFrame = getProcessedSpriteFrameCanvas(atlas, atlasFrame);
  if (!processedFrame) {
    ctx.restore();
    return false;
  }
  ctx.drawImage(processedFrame, 0, 0);

  ctx.restore();
  return true;
}

/**
 * Render animation clip
 */
export function renderAnimationClip(
  ctx: CanvasRenderingContext2D,
  animMap: CharacterAnimationMap,
  clip: AnimationClip,
  currentFrame: number,
  x: number,
  y: number,
  options: SpriteRenderOptions = DEFAULT_RENDER_OPTIONS
): boolean {
  if (!animMap.atlas) {
    return false;
  }

  const clipFrame = clip.frames[currentFrame];
  if (!clipFrame) {
    return false;
  }

  const atlasFrame = getAtlasFrame(animMap, clipFrame);
  if (!atlasFrame) {
    return false;
  }

  return renderSpriteFrame(ctx, animMap.atlas, atlasFrame, x, y, options);
}

/**
 * Render fighter with animation map and current clip
 */
export function renderFighterSprite(
  ctx: CanvasRenderingContext2D,
  animMap: CharacterAnimationMap,
  clip: AnimationClip | null,
  currentFrame: number,
  x: number,
  y: number,
  facingRight: boolean,
  depthScale = 1,
  opacity = 1,
  characterId?: string
): boolean {
  if (!clip || !animMap.atlas) {
    return false;
  }

  const clipFrame = clip.frames[currentFrame];
  if (!clipFrame) {
    return false;
  }

  const atlasFrame = getAtlasFrame(animMap, clipFrame);
  if (!atlasFrame) {
    return false;
  }

  const options: SpriteRenderOptions = {
    flipX: !facingRight,
    opacity,
    scale: depthScale,
  };

  const result = renderSpriteFrame(ctx, animMap.atlas, atlasFrame, x, y, options);

  // Debug: Show frame boundaries
  if (debugShowFrameBoundaries && result) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }
    ctx.scale(depthScale, depthScale);

    const pivotOffset = calculatePivotOffset(atlasFrame, 1);
    ctx.translate(pivotOffset.x, pivotOffset.y);

    // Draw frame boundary
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1 / depthScale; // Keep line thin regardless of scale
    ctx.strokeRect(
      -atlasFrame.frameWidth * atlasFrame.pivot.x,
      -atlasFrame.frameHeight * atlasFrame.pivot.y,
      atlasFrame.frameWidth,
      atlasFrame.frameHeight
    );

    // Draw pivot point
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(0, 0, 2 / depthScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Mark this character for fallback if rendering failed
  if (!result && characterId) {
    if (isPlayableCharacterId(characterId)) {
      markSpriteFallback(characterId);
    }
  }

  return result;
}

/**
 * Render debug overlay for sprite
 */
export function renderSpriteDebugOverlay(
  ctx: CanvasRenderingContext2D,
  animMap: CharacterAnimationMap,
  clip: AnimationClip | null,
  currentFrame: number,
  x: number,
  y: number,
  facingRight: boolean
): void {
  if (!clip || !animMap.atlas) {
    return;
  }

  const clipFrame = clip.frames[currentFrame];
  if (!clipFrame) {
    return;
  }

  const atlasFrame = getAtlasFrame(animMap, clipFrame);
  if (!atlasFrame) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  if (!facingRight) {
    ctx.scale(-1, 1);
  }

  const pivotOffset = calculatePivotOffset(atlasFrame, 1);
  ctx.translate(pivotOffset.x, pivotOffset.y);

  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(
    -atlasFrame.frameWidth * atlasFrame.pivot.x,
    -atlasFrame.frameHeight * atlasFrame.pivot.y,
    atlasFrame.frameWidth,
    atlasFrame.frameHeight
  );

  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    `${clip.name}:${currentFrame}/${clip.frames.length - 1}`,
    20,
    -atlasFrame.frameHeight * atlasFrame.pivot.y
  );

  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    `${clip.name}:${currentFrame}/${clip.frames.length - 1}`,
    20,
    -atlasFrame.frameHeight * atlasFrame.pivot.y
  );

  ctx.restore();
}

/**
 * Check if sprite rendering is available
 */
export function canRenderSprites(animMap: CharacterAnimationMap, characterId?: string): boolean {
  // Check if this character has been marked for fallback
  if (characterId && isPlayableCharacterId(characterId) && shouldUseSpriteFallback(characterId)) {
    return false;
  }

  if (!animMap.atlas) {
    return false;
  }
  // Check if the image is actually valid (has dimensions and is complete)
  if (!animMap.atlas.image) {
    return false;
  }
  if (animMap.atlas.image.width === 0 || animMap.atlas.image.height === 0) {
    return false;
  }
  // Check if the image is actually loaded (complete property)
  if (animMap.atlas.image instanceof HTMLImageElement && !animMap.atlas.image.complete) {
    return false;
  }
  return animMap.manifest.clips.length > 0;
}
