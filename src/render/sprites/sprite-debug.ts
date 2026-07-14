/**
 * Debug overlay and visualization tools for sprite system
 */

import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import { getCharacterAnimationMap } from './sprite-integration';
import { canRenderSprites, inspectSpriteFrame, renderSpriteDebugOverlay } from './sprite-renderer';
import type { AnimationClip } from './types';

/**
 * Debug overlay options
 */
export interface SpriteDebugOptions {
  showState: boolean;
  showClip: boolean;
  showFrame: boolean;
  showPivot: boolean;
  showHitboxes: boolean;
  showClipTiming: boolean;
}

/**
 * Default debug options
 */
const DEFAULT_DEBUG_OPTIONS: SpriteDebugOptions = {
  showState: true,
  showClip: true,
  showFrame: true,
  showPivot: true,
  showHitboxes: false,
  showClipTiming: false,
};

/**
 * Current debug options (can be toggled at runtime)
 */
let currentDebugOptions: SpriteDebugOptions = { ...DEFAULT_DEBUG_OPTIONS };

/**
 * Set debug option
 */
export function setSpriteDebugOption(key: keyof SpriteDebugOptions, value: boolean): void {
  currentDebugOptions[key] = value;
}

/**
 * Toggle debug option
 */
export function toggleSpriteDebugOption(key: keyof SpriteDebugOptions): void {
  currentDebugOptions[key] = !currentDebugOptions[key];
}

/**
 * Get current debug options
 */
export function getSpriteDebugOptions(): SpriteDebugOptions {
  return { ...currentDebugOptions };
}

/**
 * Reset debug options to defaults
 */
export function resetSpriteDebugOptions(): void {
  currentDebugOptions = { ...DEFAULT_DEBUG_OPTIONS };
}

/**
 * Render debug info for sprite
 */
export function renderSpriteDebugInfo(
  ctx: CanvasRenderingContext2D,
  characterId: string,
  state: string,
  clip: AnimationClip | null,
  currentFrame: number,
  x: number,
  y: number,
  facingRight: boolean
): void {
  if (
    !currentDebugOptions.showState &&
    !currentDebugOptions.showClip &&
    !currentDebugOptions.showFrame
  ) {
    return;
  }

  const animMap = getCharacterAnimationMap(
    characterId as 'camus' | 'diogenes' | 'machiavelli' | 'leibniz'
  );
  if (!animMap || !canRenderSprites(animMap)) {
    return;
  }

  if (currentDebugOptions.showPivot || currentDebugOptions.showClip) {
    renderSpriteDebugOverlay(ctx, animMap, clip, currentFrame, x, y, facingRight);
  }

  if (currentDebugOptions.showState) {
    ctx.save();
    ctx.fillStyle = '#00FF00';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state, x, y - 80);
    ctx.restore();
  }

  if (currentDebugOptions.showClipTiming && clip) {
    const currentClipFrame = clip.frames[currentFrame];
    if (currentClipFrame) {
      ctx.save();
      ctx.fillStyle = '#FFFF00';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `frame:${currentFrame}/${clip.frames.length - 1} dur:${currentClipFrame.duration}`,
        x,
        y - 95
      );
      ctx.restore();
    }
  }
}

export interface CharacterSpriteValidation {
  characterId: CharacterId;
  valid: boolean;
  issues: string[];
  warnings: string[];
  frameCount: number;
  clipCount: number;
  invalidFrameIndices: number[];
  blankFrameIndices: number[];
  backgroundLeakFrameIndices: number[];
  invalidClipReferences: string[];
  minimumOpaqueCoverage: number;
  averageOpaqueCoverage: number;
  maximumOpaqueCoverage: number;
}

export interface SpriteValidationReport {
  valid: boolean;
  characterCount: number;
  totalFrames: number;
  invalidCharacters: CharacterId[];
  blankFrameCount: number;
  backgroundLeakFrameCount: number;
  invalidClipReferenceCount: number;
  characters: Record<CharacterId, CharacterSpriteValidation>;
}

/**
 * Validate mapping coverage, atlas bounds, clip references, and the actual
 * post-keyed pixels that will be drawn by the browser renderer.
 */
export function validateSpriteMappings(characterId: CharacterId): CharacterSpriteValidation {
  const animMap = getCharacterAnimationMap(characterId);
  const issues: string[] = [];
  const warnings: string[] = [];
  const invalidFrameIndices: number[] = [];
  const blankFrameIndices: number[] = [];
  const backgroundLeakFrameIndices: number[] = [];
  const invalidClipReferences: string[] = [];

  if (!animMap) {
    return {
      characterId,
      valid: false,
      issues: [`No animation map found for ${characterId}`],
      warnings,
      frameCount: 0,
      clipCount: 0,
      invalidFrameIndices,
      blankFrameIndices,
      backgroundLeakFrameIndices,
      invalidClipReferences,
      minimumOpaqueCoverage: 0,
      averageOpaqueCoverage: 0,
      maximumOpaqueCoverage: 0,
    };
  }

  const requiredStates = [
    'idle',
    'walking',
    'running',
    'jumping',
    'blocking',
    'attacking',
    'special',
    'hitstun',
    'knockdown',
  ] as const;
  for (const state of requiredStates) {
    if (!animMap.stateToClip.has(state)) issues.push(`Missing state mapping: ${state}`);
  }

  for (const attackType of ['light', 'medium', 'heavy', 'special'] as const) {
    const phaseMap = animMap.attackPhaseToClip.get(`@${attackType}`);
    for (const phase of ['startup', 'active', 'recovery'] as const) {
      if (!phaseMap?.has(phase)) issues.push(`Missing @${attackType} ${phase} clip mapping`);
    }
  }

  if (animMap.manifest.clips.length === 0) issues.push('No clips defined in manifest');
  if (!animMap.atlas) issues.push('No atlas loaded');

  const coverage: number[] = [];
  if (animMap.atlas) {
    for (const frame of animMap.atlas.frames) {
      const inspection = inspectSpriteFrame(animMap.atlas, frame);
      coverage.push(inspection.opaqueCoverage);
      if (!inspection.boundsValid) invalidFrameIndices.push(frame.index);
      if (inspection.blank) blankFrameIndices.push(frame.index);
      if (inspection.backgroundLeak) backgroundLeakFrameIndices.push(frame.index);
      if (!inspection.backgroundLeak && inspection.topAndSideEdgeCoverage > 0.34) {
        warnings.push(
          `Frame ${frame.index} touches ${(inspection.topAndSideEdgeCoverage * 100).toFixed(1)}% of its top/side border`
        );
      }
    }

    for (const clip of animMap.manifest.clips) {
      for (const [clipFrameIndex, clipFrame] of clip.frames.entries()) {
        const atlasFrame = animMap.atlas.frames[clipFrame.frameIndex];
        if (!atlasFrame) {
          invalidClipReferences.push(`${clip.id}[${clipFrameIndex}] -> ${clipFrame.frameIndex}`);
        }
      }
    }
  }

  if (invalidFrameIndices.length > 0) {
    issues.push(`Out-of-bounds atlas frames: ${invalidFrameIndices.join(', ')}`);
  }
  if (blankFrameIndices.length > 0) {
    issues.push(`Blank post-key frames: ${blankFrameIndices.join(', ')}`);
  }
  if (backgroundLeakFrameIndices.length > 0) {
    issues.push(`Likely background leakage in frames: ${backgroundLeakFrameIndices.join(', ')}`);
  }
  if (invalidClipReferences.length > 0) {
    issues.push(`Invalid clip frame references: ${invalidClipReferences.join(', ')}`);
  }

  const coverageTotal = coverage.reduce((sum, value) => sum + value, 0);
  return {
    characterId,
    valid: issues.length === 0,
    issues,
    warnings,
    frameCount: animMap.atlas?.frames.length ?? 0,
    clipCount: animMap.manifest.clips.length,
    invalidFrameIndices,
    blankFrameIndices,
    backgroundLeakFrameIndices,
    invalidClipReferences,
    minimumOpaqueCoverage: coverage.length > 0 ? Math.min(...coverage) : 0,
    averageOpaqueCoverage: coverage.length > 0 ? coverageTotal / coverage.length : 0,
    maximumOpaqueCoverage: coverage.length > 0 ? Math.max(...coverage) : 0,
  };
}

/**
 * Validate all playable character sprites, not only the original four.
 */
export function validateAllCharacterSprites(): SpriteValidationReport {
  const characterIds = getCharacterIds();
  const characters = {} as Record<CharacterId, CharacterSpriteValidation>;
  let totalFrames = 0;
  let blankFrameCount = 0;
  let backgroundLeakFrameCount = 0;
  let invalidClipReferenceCount = 0;

  for (const characterId of characterIds) {
    const validation = validateSpriteMappings(characterId);
    characters[characterId] = validation;
    totalFrames += validation.frameCount;
    blankFrameCount += validation.blankFrameIndices.length;
    backgroundLeakFrameCount += validation.backgroundLeakFrameIndices.length;
    invalidClipReferenceCount += validation.invalidClipReferences.length;
  }

  const invalidCharacters = characterIds.filter((characterId) => !characters[characterId].valid);
  return {
    valid: invalidCharacters.length === 0,
    characterCount: characterIds.length,
    totalFrames,
    invalidCharacters,
    blankFrameCount,
    backgroundLeakFrameCount,
    invalidClipReferenceCount,
    characters,
  };
}
