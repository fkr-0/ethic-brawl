/**
 * Test setup for Vitest.
 */

import { beforeEach, vi } from 'vitest';

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fillText: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

Object.defineProperty(globalThis, 'Image', {
  writable: true,
  value: class TestImage {
    src = '';
    width = 0;
    height = 0;
  },
});

globalThis.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16)
) as unknown as typeof requestAnimationFrame;

globalThis.cancelAnimationFrame = vi.fn((handle: number) => {
  window.clearTimeout(handle);
}) as unknown as typeof cancelAnimationFrame;

beforeEach(() => {
  vi.clearAllMocks();
});
