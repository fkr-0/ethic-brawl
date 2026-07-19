import { describe, expect, it, vi } from 'vitest';
import {
  ETHIC_STAGE_CANVAS_PASS_NAME,
  installEthicCanvasBridgePasses,
  installEthicStageCanvasBridge,
} from '../../src/render/arcade-runtime-adapter';
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

  it('uses one full-size stage texture while preserving logical draw order', () => {
    const drawOrder: string[] = [];
    let installedName = '';
    let installedLayer = '';
    let update: ((frame: unknown, pass: unknown) => void) | undefined;
    const context = { clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
    const runtime = {
      snapshot: () => ({ logicalWidth: 960, logicalHeight: 540 }),
      addPass(
        name: string,
        options: { layer: string; create?: (pass: unknown) => unknown; update?: typeof update }
      ) {
        installedName = name;
        installedLayer = options.layer;
        const container = { addChild: vi.fn() };
        const pass = { name, container, runtime };
        const state = options.create?.(pass);
        update = options.update;
        return { name, layerName: options.layer, state };
      },
    } as unknown as ArcadePixiRuntime;
    const texture = { source: { update: vi.fn() }, destroy: vi.fn() };
    const PIXI = {
      Texture: { from: vi.fn(() => texture) },
      Sprite: class Sprite {
        width = 0;
        height = 0;
        label = '';
        constructor(public texture: unknown) {}
      },
    } as unknown as ArcadePixiNamespace;
    const canvasFactory = () =>
      ({ width: 0, height: 0, getContext: () => context }) as unknown as HTMLCanvasElement;

    const handle = installEthicStageCanvasBridge({
      runtime,
      PIXI,
      canvasFactory,
      drawers: {
        background: () => drawOrder.push('background'),
        arena: () => drawOrder.push('arena'),
      },
    });
    update?.(
      { deltaMs: 16, deltaSeconds: 0.016, timeMs: 16, tick: 1, runtime },
      { ...handle, runtime, state: handle.state }
    );

    expect(installedName).toBe(ETHIC_STAGE_CANVAS_PASS_NAME);
    expect(installedLayer).toBe('world');
    expect(drawOrder).toEqual(['background', 'arena']);
    expect(texture.source.update).toHaveBeenCalledOnce();
  });
});
