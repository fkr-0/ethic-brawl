import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AtlasFrame, SpriteAtlas } from '@/render/sprites/types';
import {
  calculatePivotOffset,
  inspectSpriteFrame,
  resolveFighterSpriteRenderScale,
  setChromaKey,
} from '@/render/sprites/sprite-renderer';

function frame(index: number, x: number, width = 2, height = 4): AtlasFrame {
  return {
    index,
    x,
    y: 0,
    width,
    height,
    frameWidth: width,
    frameHeight: height,
    pivot: { x: 0.25, y: 0.75 },
  };
}

afterEach(() => {
  setChromaKey(true);
  vi.restoreAllMocks();
});

describe('Ethic sprite runtime adapters', () => {
  it('delegates pivot geometry without changing the existing offset contract', () => {
    expect(calculatePivotOffset(frame(0, 0, 100, 80), 2)).toEqual({ x: -50, y: -120 });
  });

  it('preserves legacy invalid-frame diagnostics while runtime inspection stays strict', () => {
    const image = document.createElement('canvas');
    image.width = 4;
    image.height = 4;
    const atlas: SpriteAtlas = {
      characterId: 'invalid-test',
      image,
      frames: [],
      frameWidth: 4,
      frameHeight: 4,
    };
    const inspection = inspectSpriteFrame(atlas, frame(3, 3, 2, 4));
    expect(inspection).toMatchObject({
      frameIndex: 3,
      boundsValid: false,
      blank: true,
      backgroundLeak: false,
      opaqueBounds: { x: 0, y: 0, width: 0, height: 0 },
    });
  });

  it('delegates opaque-bound inspection through the processed Canvas adapter', () => {
    setChromaKey(false);
    const image = document.createElement('canvas');
    image.width = 4;
    image.height = 4;
    const data = new Uint8ClampedArray(4 * 4 * 4);
    const opaquePixels: Array<readonly [number, number]> = [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ];
    for (const [x, y] of opaquePixels) {
      data[(y * 4 + x) * 4 + 3] = 255;
    }
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data, width: 4, height: 4 })),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const atlasFrame = frame(0, 0, 4, 4);
    const atlas: SpriteAtlas = {
      characterId: 'inspection-test',
      image,
      frames: [atlasFrame],
      frameWidth: 4,
      frameHeight: 4,
    };
    expect(inspectSpriteFrame(atlas, atlasFrame)).toMatchObject({
      boundsValid: true,
      opaqueBounds: { x: 1, y: 1, width: 2, height: 2 },
      opaqueCoverage: 0.25,
      blank: false,
    });
  });

  it('uses one runtime median visible-height scale across the four representative poses', () => {
    setChromaKey(false);
    const image = document.createElement('canvas');
    image.width = 8;
    image.height = 140;
    const heights = [100, 110, 120, 130];
    let sourceX = 0;
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn((_image, x: number) => {
        sourceX = x;
      }),
      getImageData: vi.fn(() => {
        const width = 2;
        const height = 140;
        const data = new Uint8ClampedArray(width * height * 4);
        const visibleHeight = heights[Math.floor(sourceX / 2)] ?? height;
        for (let y = height - visibleHeight; y < height; y += 1) {
          data[y * width * 4 + 3] = 255;
        }
        return { data, width, height };
      }),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const frames = heights.map((_, index) => frame(index, index * 2, 2, 140));
    const atlas: SpriteAtlas = {
      characterId: 'scale-test',
      image,
      frames,
      frameWidth: 2,
      frameHeight: 140,
    };
    expect(resolveFighterSpriteRenderScale(atlas, 1, 1)).toBeCloseTo(132 / 120, 6);
    expect(resolveFighterSpriteRenderScale(atlas, 0.9, 1.1)).toBeCloseTo((132 / 120) * 0.99, 6);
  });
});
