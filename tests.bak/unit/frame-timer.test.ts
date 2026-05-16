import { FrameTimer } from '@/app/game-loop';
import { describe, expect, it } from 'vitest';

describe('FrameTimer', () => {
  it('ping-pongs through the frame range instead of snapping back to zero', () => {
    const timer = new FrameTimer(4, false, true);

    const frames = Array.from({ length: 7 }, () => timer.advance());

    expect(frames).toEqual([1, 2, 3, 2, 1, 0, 1]);
  });

  it('clamps setProgress into the valid frame range', () => {
    const timer = new FrameTimer(5);

    timer.setProgress(2);
    expect(timer.getFrame()).toBe(4);

    timer.setProgress(-1);
    expect(timer.getFrame()).toBe(0);
  });
});
