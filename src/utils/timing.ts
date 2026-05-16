/**
 * Timing and frame utilities
 */

/**
 * Convert frames to milliseconds at 60fps
 */
export function framesToMs(frames: number): number {
  return (frames / 60) * 1000;
}

/**
 * Convert milliseconds to frames at 60fps
 */
export function msToFrames(ms: number): number {
  return (ms / 1000) * 60;
}

/**
 * Fixed timestep for game loop (16.67ms at 60fps)
 */
export const FIXED_TIMESTEP = 1000 / 60;

/**
 * Target frames per second
 */
export const TARGET_FPS = 60;

/**
 * Create a debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Create a throttle function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

/**
 * Simple timer class
 */
export class Timer {
  private elapsed = 0;
  private running = false;

  constructor(private duration: number) {}

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  reset(): void {
    this.elapsed = 0;
    this.running = false;
  }

  update(deltaMs: number): void {
    if (this.running) {
      this.elapsed += deltaMs;
    }
  }

  isComplete(): boolean {
    return this.elapsed >= this.duration;
  }

  getProgress(): number {
    if (this.duration <= 0) {
      return 1;
    }

    return Math.min(1, this.elapsed / this.duration);
  }

  getRemaining(): number {
    return Math.max(0, this.duration - this.elapsed);
  }
}

/**
 * Frame counter for animations
 */
export class FrameCounter {
  private frame = 0;

  constructor(
    private totalFrames: number,
    private looping = false
  ) {}

  advance(): boolean {
    this.frame++;
    if (this.frame >= this.totalFrames) {
      if (this.looping) {
        this.frame = 0;
      }
      return true;
    }
    return false;
  }

  reset(): void {
    this.frame = 0;
  }

  getFrame(): number {
    return this.frame;
  }

  isComplete(): boolean {
    return this.frame >= this.totalFrames - 1;
  }

  getProgress(): number {
    if (this.totalFrames <= 1) {
      return 1;
    }

    return this.frame / (this.totalFrames - 1);
  }
}

/**
 * Cooldown tracker
 */
export class Cooldown {
  private remaining = 0;

  constructor(private durationFrames: number) {}

  trigger(): void {
    this.remaining = this.durationFrames;
  }

  update(): void {
    if (this.remaining > 0) {
      this.remaining--;
    }
  }

  isReady(): boolean {
    return this.remaining <= 0;
  }

  getRemaining(): number {
    return this.remaining;
  }

  getProgress(): number {
    if (this.durationFrames === 0) return 1;
    return 1 - this.remaining / this.durationFrames;
  }

  reset(): void {
    this.remaining = 0;
  }
}

/**
 * Double-tap detector
 */
export class DoubleTapDetector {
  private lastTapTime = 0;
  private tapCount = 0;

  constructor(private windowMs = 200) {}

  check(): boolean {
    const now = performance.now();
    const timeSinceLast = now - this.lastTapTime;

    if (timeSinceLast < this.windowMs) {
      this.tapCount++;
      this.lastTapTime = now;
      if (this.tapCount >= 2) {
        this.tapCount = 0;
        return true;
      }
    } else {
      this.tapCount = 1;
      this.lastTapTime = now;
    }

    return false;
  }

  reset(): void {
    this.lastTapTime = 0;
    this.tapCount = 0;
  }
}
