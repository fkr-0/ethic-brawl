/**
 * Ethic Brawl compatibility adapter for the shared renderer-neutral arcade loop.
 */

import { createFixedStepLoop } from '../../vendor/arcade-core.mjs';
import { clamp } from '@/utils/math';
import { FIXED_TIMESTEP } from './config';

export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = (interpolation: number) => void;

export function createGameLoop(update: UpdateCallback, render: RenderCallback) {
  return createFixedStepLoop({
    update,
    render,
    fixedStep: FIXED_TIMESTEP,
    maxFrame: 100,
    timeUnit: 'milliseconds',
  });
}

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
      if (this.currentFrame >= this.totalFrames - 1) this.direction = -1;
      else if (this.currentFrame <= 0) this.direction = 1;
      this.currentFrame = clamp(this.currentFrame + this.direction, 0, this.totalFrames - 1);
      return this.currentFrame;
    }
    this.currentFrame++;
    if (this.currentFrame >= this.totalFrames) {
      this.currentFrame = this.looping ? 0 : this.totalFrames - 1;
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
