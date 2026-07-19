/**
 * Animation player for sprite clips
 */

import type { AnimationClip, AnimationPlayerState, ClipFrame } from './types';

/**
 * Create initial animation player state
 */
export function createAnimationPlayerState(): AnimationPlayerState {
  return {
    currentClip: null,
    currentFrame: 0,
    frameTimer: 0,
    isPlaying: false,
    isPaused: false,
    playbackSpeed: 1,
    direction: 1,
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
  return {
    ...state,
    currentClip: clip,
    currentFrame: 0,
    frameTimer: 0,
    isPlaying: true,
    isPaused: false,
    playbackSpeed: speed,
    direction: 1,
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
  const currentFrameData = clip.frames[state.currentFrame];

  if (!currentFrameData) {
    return state;
  }

  let newFrameTimer = state.frameTimer + deltaTime * state.playbackSpeed;
  let newCurrentFrame = state.currentFrame;
  let newDirection = state.direction;

  while (newFrameTimer >= currentFrameData.duration) {
    newFrameTimer -= currentFrameData.duration;

    switch (clip.mode) {
      case 'once':
        if (newCurrentFrame < clip.frames.length - 1) {
          newCurrentFrame++;
        } else {
          // For single-frame animations, keep them playing so they don't disappear
          if (clip.frames.length === 1) {
            // Keep the single frame visible and active
            return {
              ...state,
              frameTimer: newFrameTimer,
              currentFrame: 0,
              isPlaying: true, // Keep playing for single-frame animations
            };
          }
          return {
            ...state,
            frameTimer: newFrameTimer,
            currentFrame: newCurrentFrame,
            isPlaying: false,
          };
        }
        break;

      case 'loop':
        newCurrentFrame = (newCurrentFrame + 1) % clip.frames.length;
        break;

      case 'pingpong':
        if (newDirection === 1) {
          if (newCurrentFrame < clip.frames.length - 1) {
            newCurrentFrame++;
          } else {
            newDirection = -1;
            newCurrentFrame = clip.frames.length - 2;
          }
        } else {
          if (newCurrentFrame > 0) {
            newCurrentFrame--;
          } else {
            newDirection = 1;
            newCurrentFrame = 1;
          }
        }
        break;
    }
  }

  return {
    ...state,
    frameTimer: newFrameTimer,
    currentFrame: newCurrentFrame,
    direction: newDirection,
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
  const currentClipFrame = clip.frames[state.currentFrame];
  return (
    clip.mode === 'once' &&
    state.currentFrame === clip.frames.length - 1 &&
    currentClipFrame !== undefined &&
    state.frameTimer >= currentClipFrame.duration
  );
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
