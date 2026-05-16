/**
 * Debug overlay and visualization tools for sprite system
 */

import { getCharacterAnimationMap } from './sprite-integration';
import { canRenderSprites, renderSpriteDebugOverlay } from './sprite-renderer';
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

/**
 * Validate sprite mapping coverage
 */
export function validateSpriteMappings(characterId: string): {
  valid: boolean;
  issues: string[];
} {
  const animMap = getCharacterAnimationMap(
    characterId as 'camus' | 'diogenes' | 'machiavelli' | 'leibniz'
  );
  const issues: string[] = [];

  if (!animMap) {
    return { valid: false, issues: [`No animation map found for ${characterId}`] };
  }

  const requiredStates: Array<
    'idle' | 'walking' | 'running' | 'jumping' | 'blocking' | 'attacking'
  > = ['idle', 'walking', 'running', 'jumping', 'blocking', 'attacking'];
  for (const state of requiredStates) {
    if (!animMap.stateToClip.has(state)) {
      issues.push(`Missing state mapping: ${state}`);
    }
  }

  if (animMap.manifest.clips.length === 0) {
    issues.push('No clips defined in manifest');
  }

  if (!animMap.atlas) {
    issues.push('No atlas loaded');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Validate all character sprite mappings
 */
export function validateAllCharacterSprites(): Record<
  string,
  { valid: boolean; issues: string[] }
> {
  const characters = ['camus', 'diogenes', 'machiavelli', 'leibniz'] as const;
  const results: Record<string, { valid: boolean; issues: string[] }> = {};

  for (const charId of characters) {
    results[charId] = validateSpriteMappings(charId);
  }

  return results;
}
