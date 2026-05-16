/**
 * Screen effects - full-screen visual effects
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';

export interface ScreenEffectConfig {
  type: 'flash' | 'fade' | 'glitch' | 'scanline';
  duration: number;
  color?: string;
  intensity?: number;
}

export class ScreenEffect {
  private config: ScreenEffectConfig;
  private timer = 0;
  private active = false;

  constructor(config: ScreenEffectConfig) {
    this.config = config;
  }

  start(): void {
    this.timer = this.config.duration;
    this.active = true;
  }

  update(): boolean {
    if (!this.active) return false;

    this.timer--;
    if (this.timer <= 0) {
      this.active = false;
      return false;
    }
    return true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const progress = 1 - this.timer / this.config.duration;
    const alpha = this.config.intensity ?? 1;

    switch (this.config.type) {
      case 'flash':
        this.renderFlash(ctx, progress, alpha);
        break;
      case 'fade':
        this.renderFade(ctx, progress, alpha);
        break;
      case 'glitch':
        this.renderGlitch(ctx, progress, alpha);
        break;
      case 'scanline':
        this.renderScanline(ctx, progress, alpha);
        break;
    }
  }

  private renderFlash(ctx: CanvasRenderingContext2D, progress: number, alpha: number): void {
    ctx.fillStyle = this.config.color ?? '#FFFFFF';
    ctx.globalAlpha = alpha * (1 - progress);
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }

  private renderFade(ctx: CanvasRenderingContext2D, progress: number, alpha: number): void {
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = alpha * progress;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
  }

  private renderGlitch(ctx: CanvasRenderingContext2D, progress: number, alpha: number): void {
    const intensity = (this.config.intensity ?? 0.5) * (1 - progress);

    // Random horizontal strips
    for (let i = 0; i < 5; i++) {
      if (Math.random() < intensity) {
        const y = Math.random() * CANVAS_HEIGHT;
        const height = Math.random() * 20 + 2;
        const width = CANVAS_WIDTH;

        ctx.fillStyle = this.config.color ?? '#00F5FF';
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillRect(0, y, width, height);
        ctx.globalAlpha = 1;

        // Offset channel effect
        const offset = (Math.random() - 0.5) * 10;
        ctx.fillStyle = '#FF00FF';
        ctx.globalAlpha = alpha * 0.2;
        ctx.fillRect(offset, y, width / 2, height);
        ctx.globalAlpha = 1;
      }
    }

    // Chromatic aberration
    if (Math.random() < intensity * 0.5) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 5, 0);

      ctx.fillStyle = '#FF0000';
      ctx.globalAlpha = alpha * 0.1;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.restore();
    }
  }

  private renderScanline(ctx: CanvasRenderingContext2D, progress: number, alpha: number): void {
    const y = (progress * CANVAS_HEIGHT) % 4;

    ctx.fillStyle = '#00F5FF';
    ctx.globalAlpha = alpha * 0.1;
    ctx.fillRect(0, y, CANVAS_WIDTH, 2);
    ctx.globalAlpha = 1;

    // Add scanline trail
    for (let i = 1; i < 5; i++) {
      const trailY = (y - i * 3 + CANVAS_HEIGHT) % CANVAS_HEIGHT;
      ctx.globalAlpha = (alpha * 0.05) / i;
      ctx.fillRect(0, trailY, CANVAS_WIDTH, 1);
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Create a flash effect
 */
export function createFlashEffect(duration = 10, color = '#FFFFFF', intensity = 1): ScreenEffect {
  return new ScreenEffect({
    type: 'flash',
    duration,
    color,
    intensity,
  });
}

/**
 * Create a glitch effect
 */
export function createGlitchEffect(duration = 30, intensity = 0.5): ScreenEffect {
  return new ScreenEffect({
    type: 'glitch',
    duration,
    intensity,
  });
}

/**
 * Create a scanline effect
 */
export function createScanlineEffect(duration = 60, intensity = 0.3): ScreenEffect {
  return new ScreenEffect({
    type: 'scanline',
    duration,
    intensity,
  });
}
