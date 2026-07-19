/**
 * Animation player for sprite clips
 */

import type { AnimationClip, AnimationPlayerState, ClipFrame } from './types';
import {
  advanceArcadeAnimationClock,
  createArcadeAnimationClock,
  playArcadeAnimationClock,
} from '../../../vendor/arcade-runtime.mjs';

/**
 * Create initial animation player state
 */
export function createAnimationPlayerState(): AnimationPlayerState {
  const clock = createArcadeAnimationClock();
  return {
    currentClip: null,
    currentFrame: clock.frame,
    frameTimer: clock.elapsed,
    isPlaying: clock.playing,
    isPaused: clock.paused,
    playbackSpeed: 1,
    direction: clock.direction,
  };
}

/**
 * Play a clip
 */
export function playClip(
  state: AnimationPlayerState,
  clip: AnimationClip,
  speed = 1
): AnimationPlayerState {
  const clock = playArcadeAnimationClock(createArcadeAnimationClock());
  return {
    ...state,
    currentClip: clip,
    currentFrame: clock.frame,
    frameTimer: clock.elapsed,
    isPlaying: clock.playing,
    isPaused: clock.paused,
    playbackSpeed: speed,
    direction: clock.direction,
  };
}

/**
 * Stop playback
 */
export function stopClip(state: AnimationPlayerState): AnimationPlayerState {
  return {
    ...state,
    isPlaying: false,
    currentClip: null,
    currentFrame: 0,
    frameTimer: 0,
  };
}

/**
 * Pause playback
 */
export function pauseClip(state: AnimationPlayerState): AnimationPlayerState {
  return {
    ...state,
    isPaused: true,
  };
}

/**
 * Resume playback
 */
export function resumeClip(state: AnimationPlayerState): AnimationPlayerState {
  return {
    ...state,
    isPaused: false,
  };
}

/**
 * Set playback speed
 */
export function setPlaybackSpeed(state: AnimationPlayerState, speed: number): AnimationPlayerState {
  return {
    ...state,
    playbackSpeed: speed,
  };
}

/**
 * Get current clip frame
 */
export function getCurrentClipFrame(state: AnimationPlayerState): ClipFrame | null {
  if (!state.currentClip) {
    return null;
  }

  return state.currentClip.frames[state.currentFrame] ?? null;
}

/**
 * Update animation player
 */
export function updateAnimationPlayer(
  state: AnimationPlayerState,
  deltaTime: number
): AnimationPlayerState {
  if (!state.isPlaying || state.isPaused || !state.currentClip) {
    return state;
  }

  const clip = state.currentClip;
  const clock = advanceArcadeAnimationClock(
    {
      frame: state.currentFrame,
      elapsed: state.frameTimer,
      direction: state.direction,
      playing: state.isPlaying,
      paused: state.isPaused,
    },
    deltaTime,
    {
      frameCount: clip.frames.length,
      frameDuration: (frame) => clip.frames[frame]?.duration ?? 1,
      mode: clip.mode,
      speed: state.playbackSpeed,
    }
  );

  return {
    ...state,
    frameTimer: clock.elapsed,
    currentFrame: clock.frame,
    direction: clock.direction,
    isPlaying: clock.playing,
    isPaused: clock.paused,
  };
}

/**
 * Check if animation is complete
 */
export function isAnimationComplete(state: AnimationPlayerState): boolean {
  if (!state.currentClip || state.isPlaying) {
    return false;
  }

  const clip = state.currentClip;
  return clip.mode === 'once' && state.currentFrame === clip.frames.length - 1;
}

/**
 * Get animation progress (0-1)
 */
export function getAnimationProgress(state: AnimationPlayerState): number {
  if (!state.currentClip || state.currentClip.frames.length === 0) {
    return 0;
  }

  return state.currentFrame / (state.currentClip.frames.length - 1);
}

/**
 * Reset animation to beginning
 */
export function resetAnimation(state: AnimationPlayerState): AnimationPlayerState {
  return {
    ...state,
    currentFrame: 0,
    frameTimer: 0,
    direction: 1,
  };
}

/**
 * Seek to specific frame
 */
export function seekToFrame(state: AnimationPlayerState, frameIndex: number): AnimationPlayerState {
  const clampedIndex = Math.max(
    0,
    Math.min(frameIndex, (state.currentClip?.frames.length ?? 1) - 1)
  );

  return {
    ...state,
    currentFrame: clampedIndex,
    frameTimer: 0,
  };
}

/**
 * Seek to progress (0-1)
 */
export function seekToProgress(
  state: AnimationPlayerState,
  progress: number
): AnimationPlayerState {
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  if (!state.currentClip?.frames || state.currentClip.frames.length === 0) {
    return state;
  }

  const targetFrame = Math.floor(clampedProgress * (state.currentClip.frames.length - 1));
  return seekToFrame(state, targetFrame);
}
