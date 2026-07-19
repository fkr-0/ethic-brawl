import type { FightRuntime } from '@/app/fight-runtime';
import * as PIXI from 'pixi.js';
import {
  createArcadeCameraTransform,
  createArcadePixiRuntime,
} from '../../vendor/arcade-pixi-runtime.mjs';
import type { ArcadePixiRuntime } from '../../vendor/arcade-pixi-runtime.mjs';
import { installEthicCanvasBridgePasses } from './arcade-runtime-adapter';
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

export async function createEthicPixiBridge(options: {
  mount: HTMLElement;
  sourceCanvas: HTMLCanvasElement;
  fightRuntime: FightRuntime;
  width: number;
  height: number;
}): Promise<EthicPixiBridgeController> {
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

  installEthicCanvasBridgePasses({
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
  canvas.style.removeProperty('width');
  canvas.style.removeProperty('height');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.rendererMode = 'bridge';
  canvas.style.pointerEvents = 'none';
  options.sourceCanvas.dataset.rendererMode = 'bridge-overlay';

  return {
    enabled: true,
    runtime,
    setPresentation(next) {
      presentation = { ...next };
    },
    render(active, timeMs = performance.now()) {
      canvas.hidden = !active;
      if (active) runtime.step(0, timeMs, true);
    },
    snapshot: () => runtime.snapshot(),
    destroy: () => runtime.destroy(true),
  };
}
