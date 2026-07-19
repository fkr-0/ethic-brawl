import { describe, expect, it, vi } from 'vitest';
import { installEthicCanvasBridgePasses } from '../../src/render/arcade-runtime-adapter';
import type { ArcadePixiNamespace, ArcadePixiRuntime } from '../../vendor/arcade-pixi-runtime.mjs';

describe('Ethic Brawl shared-runtime bridge adapter', () => {
  it('installs only supplied ready Canvas passes in the canonical layers', () => {
    const installed: Array<{ name: string; layer: string; create: unknown }> = [];
    const runtime = {
      addPass(name: string, options: { layer: string; create?: unknown }) {
        installed.push({ name, layer: options.layer, create: options.create });
        return { name, layerName: options.layer };
      },
    } as unknown as ArcadePixiRuntime;
    const PIXI = {
      Texture: class Texture {},
      Sprite: class Sprite {},
    } as unknown as ArcadePixiNamespace;

    const handles = installEthicCanvasBridgePasses({
      runtime,
      PIXI,
      drawers: {
        background: vi.fn(),
        arena: vi.fn(),
        'fight-hud': vi.fn(),
      },
    });

    expect(installed.map(({ name, layer }) => [name, layer])).toEqual([
      ['background', 'backdrop'],
      ['arena', 'world'],
      ['fight-hud', 'hud'],
    ]);
    expect(installed.every(({ create }) => typeof create === 'function')).toBe(true);
    expect(Object.keys(handles)).toEqual(['background', 'arena', 'fight-hud']);
  });
});
