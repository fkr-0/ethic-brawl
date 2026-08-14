import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AtlasFrame, SpriteAtlas } from '@/render/sprites/types';
import {
  calculatePivotOffset,
  inspectSpriteFrame,
  removeSpriteFrameBorderLines,
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

  it('compensates for half-resolution legacy frames inside an animation-v2 atlas', () => {
    setChromaKey(false);
    const image = document.createElement('canvas');
    image.width = 8;
    image.height = 140;
    const data = new Uint8ClampedArray(2 * 140 * 4);
    for (let y = 8; y < 140; y += 1) data[y * 2 * 4 + 3] = 255;
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data, width: 2, height: 140 })),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const representativeFrames = [0, 1, 2, 3].map((index) => frame(index, index * 2, 2, 140));
    const legacyFrame = frame(16, 0, 64, 70);
    const atlas: SpriteAtlas = {
      characterId: 'mixed-resolution-scale-test',
      image,
      frames: [...representativeFrames, legacyFrame],
      frameWidth: 128,
      frameHeight: 140,
    };

    expect(resolveFighterSpriteRenderScale(atlas, 1, 1, legacyFrame)).toBeCloseTo(2, 6);
  });

  it('removes dense outer cell borders without erasing the sprite body', () => {
    const width = 8;
    const height = 8;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      data[y * width * 4 + 3] = 255;
      data[(y * width + width - 1) * 4 + 3] = 255;
    }
    for (const [x, y] of [
      [3, 3],
      [4, 3],
      [3, 4],
      [4, 4],
    ] as const) {
      data[(y * width + x) * 4 + 3] = 255;
    }
    const imageData = { data, width, height } as ImageData;

    removeSpriteFrameBorderLines(imageData);

    expect(data[3]).toBe(0);
    expect(data[((height - 1) * width + width - 1) * 4 + 3]).toBe(0);
    expect(data[(3 * width + 3) * 4 + 3]).toBe(255);
    expect(data[(4 * width + 4) * 4 + 3]).toBe(255);
  });
});
