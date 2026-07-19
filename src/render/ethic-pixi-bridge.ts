import type { FightRuntime } from '@/app/fight-runtime';
import {
  createArcadeCameraTransform,
  createArcadePixiRuntime,
} from '../../vendor/arcade-pixi-runtime.mjs';
import type { ArcadePixiNamespace, ArcadePixiRuntime } from '../../vendor/arcade-pixi-runtime.mjs';
import { installEthicStageCanvasBridge } from './arcade-runtime-adapter';
import { ETHIC_PIXI_LAYERS } from './arcade-runtime-contract';
import type { FightPresentationOptions } from './fight-presentation';
import { resolveFightGraphicsProfile } from './fight-presentation';
import { renderArena, renderBackground } from './renderer';

export const ETHIC_PIXI_BRIDGE_QUERY = 'renderer=bridge';

export function isEthicPixiBridgeRequested(search = globalThis.location?.search ?? ''): boolean {
  const params = new URLSearchParams(search);
  return params.get('renderer') === 'bridge' || params.get('pixiBridge') === '1';
}

export interface EthicPixiBridgeController {
  readonly enabled: true;
  readonly runtime: ArcadePixiRuntime;
  setPresentation(options: FightPresentationOptions): void;
  render(active: boolean, timeMs?: number): void;
  snapshot(): ReturnType<ArcadePixiRuntime['snapshot']>;
  destroy(): void;
}

export interface EthicPixiBridgeAttempt {
  controller: EthicPixiBridgeController | null;
  failureReason: string | null;
}

export interface EthicPixiBridgeOptions {
  mount: HTMLElement;
  sourceCanvas: HTMLCanvasElement;
  fightRuntime: FightRuntime;
  width: number;
  height: number;
  loadPixi?: () => Promise<ArcadePixiNamespace>;
}

export async function createEthicPixiBridge(
  options: EthicPixiBridgeOptions
): Promise<EthicPixiBridgeController> {
  const PIXI = options.loadPixi ? await options.loadPixi() : await import('pixi.js');
  let presentation: FightPresentationOptions = {};
  const runtime = await createArcadePixiRuntime({
    PIXI,
    mount: options.mount,
    logicalWidth: options.width,
    logicalHeight: options.height,
    backgroundAlpha: 0,
    canvasId: 'ethic-pixi-bridge',
    layers: ETHIC_PIXI_LAYERS,
    autoRender: false,
  });
  const cameraTransform = createArcadeCameraTransform({
    x: options.width / 2,
    y: options.height / 2,
    viewportWidth: options.width,
    viewportHeight: options.height,
    anchorX: 0.5,
    anchorY: 0.5,
  });

  const prepareContext = (context: CanvasRenderingContext2D) => {
    const camera = options.fightRuntime.getCamera();
    cameraTransform.set({
      zoom: camera.zoom,
      shakeX: camera.shakeOffsetX,
      shakeY: camera.shakeOffsetY,
    });
    context.save();
    cameraTransform.applyToCanvas(context);
  };

  installEthicStageCanvasBridge({
    runtime,
    PIXI,
    drawers: {
      background: (context) => {
        const state = options.fightRuntime.getState();
        if (!state) return;
        prepareContext(context);
        renderBackground(
          context,
          options.fightRuntime.getCamera(),
          state.frameCount,
          resolveFightGraphicsProfile(presentation)
        );
        context.restore();
      },
      arena: (context) => {
        const state = options.fightRuntime.getState();
        if (!state) return;
        prepareContext(context);
        renderArena(
          context,
          options.fightRuntime.getCamera(),
          resolveFightGraphicsProfile(presentation),
          state.frameCount
        );
        context.restore();
      },
    },
  });

  const canvas = runtime.canvas;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.rendererMode = 'bridge';
  canvas.style.pointerEvents = 'none';
  options.sourceCanvas.dataset.rendererMode = 'bridge-overlay';
  let lastRenderTime: number | null = null;

  return {
    enabled: true,
    runtime,
    setPresentation(next) {
      presentation = { ...next };
    },
    render(active, timeMs = performance.now()) {
      canvas.hidden = !active;
      if (!active) {
        lastRenderTime = null;
        return;
      }
      const deltaMs = lastRenderTime === null ? 1000 / 60 : timeMs - lastRenderTime;
      lastRenderTime = timeMs;
      runtime.step(deltaMs, timeMs, true);
    },
    snapshot: () => runtime.snapshot(),
    destroy: () => {
      delete options.sourceCanvas.dataset.rendererMode;
      runtime.destroy(true);
    },
  };
}

export async function tryCreateEthicPixiBridge(
  options: EthicPixiBridgeOptions
): Promise<EthicPixiBridgeAttempt> {
  try {
    return {
      controller: await createEthicPixiBridge(options),
      failureReason: null,
    };
  } catch (error) {
    delete options.sourceCanvas.dataset.rendererMode;
    const failureReason = error instanceof Error ? error.message : String(error);
    console.warn('Pixi bridge unavailable; continuing with Canvas2D:', failureReason);
    return { controller: null, failureReason };
  }
}
