import { FrameCounter, Timer } from '@/utils/timing';
import { describe, expect, it } from 'vitest';

describe('timing utilities', () => {
  it('treats zero-duration timers as immediately complete', () => {
    const timer = new Timer(0);

    expect(timer.isComplete()).toBe(true);
    expect(timer.getRemaining()).toBe(0);
    expect(timer.getProgress()).toBe(1);
  });

  it('reports full progress for single-frame counters instead of NaN', () => {
    const counter = new FrameCounter(1);

    expect(counter.isComplete()).toBe(true);
    expect(counter.getProgress()).toBe(1);
  });
});
