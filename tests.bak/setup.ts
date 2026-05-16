/**
 * Test setup for Vitest
 */

import { beforeEach, vi } from 'vitest';

// Declare global extensions
declare global {
  var HTMLCanvasElement: any;
  var Image: any;
  var requestAnimationFrame: any;
  var cancelAnimationFrame: any;
}

// Mock canvas context
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
})) as any;

// Mock Image class
global.Image = class Image {
  src = '';
  width = 0;
  height = 0;
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: any) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});
