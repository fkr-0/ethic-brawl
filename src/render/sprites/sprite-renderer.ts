/**
 * Sprite renderer for fighter sprites
 */

import type { CharacterId } from '@/content/characters/character-data';
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
interface ChromaKeySettings {
  enabled: boolean;
  threshold: number;
  r: number;
  g: number;
  b: number;
}

let chromaKeySettings: ChromaKeySettings = {
  enabled: true,
  threshold: 30,
  r: 255,
  g: 255,
  b: 255, // Remove white background by default
};

function isPlayableCharacterId(characterId: string): characterId is CharacterId {
  return (
    characterId === 'camus' ||
    characterId === 'diogenes' ||
    characterId === 'leibniz' ||
    characterId === 'machiavelli'
  );
}

export function setChromaKey(enabled: boolean, r = 255, g = 255, b = 255, threshold = 30): void {
  chromaKeySettings = { enabled, r, g, b, threshold };
  console.info(
    `🎨 Chroma key ${enabled ? 'enabled' : 'disabled'}: RGB(${r}, ${g}, ${b}) threshold: ${threshold}`
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
 * Apply chroma key to a canvas context
 */
function applyChromaKey(imageData: ImageData, settings: ChromaKeySettings): void {
  const data = imageData.data;
  const { r, g, b, threshold } = settings;

  for (let i = 0; i < data.length; i += 4) {
    const pixelR = data[i] ?? 0;
    const pixelG = data[i + 1] ?? 0;
    const pixelB = data[i + 2] ?? 0;

    // Calculate color distance
    const distance = Math.sqrt((pixelR - r) ** 2 + (pixelG - g) ** 2 + (pixelB - b) ** 2);

    if (distance < threshold) {
      // Make pixel transparent
      data[i + 3] = 0;
    }
  }
}

/**
 * Get or create an offscreen canvas for chroma key processing
 */
const chromaKeyCanvasCache = new Map<string, HTMLCanvasElement>();

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
  }
  return canvas;
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

  // Apply chroma key if enabled
  if (chromaKeySettings.enabled) {
    // Use offscreen canvas for chroma key processing
    const cacheKey = `${atlas.characterId}_${atlasFrame.index}`;
    const chromaCanvas = getChromaKeyCanvas(
      cacheKey,
      atlasFrame.frameWidth,
      atlasFrame.frameHeight
    );
    const chromaCtx = chromaCanvas.getContext('2d');

    if (chromaCtx) {
      // Draw the sprite frame to the offscreen canvas
      chromaCtx.clearRect(0, 0, atlasFrame.frameWidth, atlasFrame.frameHeight);
      chromaCtx.drawImage(
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

      // Apply chroma key
      const imageData = chromaCtx.getImageData(0, 0, atlasFrame.frameWidth, atlasFrame.frameHeight);
      applyChromaKey(imageData, chromaKeySettings);
      chromaCtx.putImageData(imageData, 0, 0);

      // Draw the processed image
      ctx.drawImage(chromaCanvas, 0, 0);
    }
  } else {
    // Draw directly without chroma key
    ctx.drawImage(
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
  }

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
  if (!(animMap.atlas.image instanceof HTMLImageElement) || !animMap.atlas.image.complete) {
    return false;
  }
  return animMap.manifest.clips.length > 0;
}
