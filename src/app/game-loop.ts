/**
 * Main game loop implementation with fixed timestep
 */

import { clamp } from '@/utils/math';
import { FIXED_TIMESTEP } from './config';

/**
 * Callback types for the game loop
 */
export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = (interpolation: number) => void;

/**
 * Game loop state
 */
interface LoopState {
  lastTime: number;
  accumulator: number;
  frameCount: number;
  fps: number;
  fpsUpdateTime: number;
  fpsFrameCount: number;
  isPaused: boolean;
  isRunning: boolean;
}

/**
 * Create and start the game loop
 */
export function createGameLoop(
  update: UpdateCallback,
  render: RenderCallback
): {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getFPS: () => number;
  getFrameCount: () => number;
  isPaused: () => boolean;
} {
  const state: LoopState = {
    lastTime: 0,
    accumulator: 0,
    frameCount: 0,
    fps: 60,
    fpsUpdateTime: 0,
    fpsFrameCount: 0,
    isPaused: false,
    isRunning: false,
  };

  let animationFrameId: number | null = null;

  const loop = (timestamp: number): void => {
    if (!state.isRunning) return;

    // Calculate delta time
    const deltaTime = timestamp - state.lastTime;
    state.lastTime = timestamp;

    // Skip huge time jumps (e.g., tab was inactive)
    const clampedDelta = Math.min(deltaTime, 100);

    // Update FPS counter
    state.fpsFrameCount++;
    if (timestamp - state.fpsUpdateTime >= 1000) {
      state.fps = state.fpsFrameCount;
      state.fpsFrameCount = 0;
      state.fpsUpdateTime = timestamp;
    }

    if (!state.isPaused) {
      // Fixed timestep update
      state.accumulator += clampedDelta;

      while (state.accumulator >= FIXED_TIMESTEP) {
        update(FIXED_TIMESTEP);
        state.accumulator -= FIXED_TIMESTEP;
        state.frameCount++;
      }

      // Render with interpolation
      const interpolation = state.accumulator / FIXED_TIMESTEP;
      render(interpolation);
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  return {
    start: () => {
      if (state.isRunning) return;
      state.isRunning = true;
      state.lastTime = performance.now();
      state.fpsUpdateTime = state.lastTime;
      animationFrameId = requestAnimationFrame(loop);
    },

    stop: () => {
      state.isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    pause: () => {
      state.isPaused = true;
    },

    resume: () => {
      state.isPaused = false;
    },

    getFPS: () => state.fps,

    getFrameCount: () => state.frameCount,

    isPaused: () => state.isPaused,
  };
}

/**
 * Simple frame timer for animations
 */
export class FrameTimer {
  private currentFrame = 0;
  private direction = 1;

  constructor(
    private totalFrames: number,
    private looping = false,
    private pingPong = false
  ) {}

  advance(): number {
    if (this.totalFrames <= 1) {
      this.currentFrame = 0;
      return this.currentFrame;
    }

    if (this.pingPong) {
      if (this.currentFrame >= this.totalFrames - 1) {
        this.direction = -1;
      } else if (this.currentFrame <= 0) {
        this.direction = 1;
      }

      this.currentFrame = clamp(this.currentFrame + this.direction, 0, this.totalFrames - 1);
      return this.currentFrame;
    }

    this.currentFrame++;

    if (this.currentFrame >= this.totalFrames) {
      if (this.looping) {
        this.currentFrame = 0;
      } else {
        this.currentFrame = this.totalFrames - 1;
      }
    }

    return this.currentFrame;
  }

  getFrame(): number {
    return this.currentFrame;
  }

  reset(): void {
    this.currentFrame = 0;
    this.direction = 1;
  }

  isComplete(): boolean {
    return this.currentFrame >= this.totalFrames - 1;
  }

  setProgress(progress: number): void {
    this.currentFrame = Math.floor(clamp(progress, 0, 1) * Math.max(0, this.totalFrames - 1));
  }
}
