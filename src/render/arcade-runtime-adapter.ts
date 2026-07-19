import {
  createCanvasTexturePass,
  createCanvasTexturePassOptions,
  installArcadeRenderPlan,
} from '../../vendor/arcade-runtime.mjs';
import type {
  ArcadePixiFrame,
  ArcadePixiNamespace,
  ArcadePixiRuntime,
} from '../../vendor/arcade-runtime.mjs';
import { ETHIC_PIXI_BRIDGE_PASSES } from './arcade-runtime-contract';

export type EthicCanvasBridgePassName =
  | 'background'
  | 'stage-depth'
  | 'arena'
  | 'foreground'
  | 'fight-hud'
  | 'scene-ui';

export type EthicCanvasBridgeDrawer = (
  context: CanvasRenderingContext2D,
  frame: ArcadePixiFrame
) => void;

export interface EthicCanvasBridgeOptions {
  runtime: ArcadePixiRuntime;
  PIXI: ArcadePixiNamespace;
  drawers: Partial<Record<EthicCanvasBridgePassName, EthicCanvasBridgeDrawer>>;
  canvasFactory?: (width: number, height: number) => HTMLCanvasElement;
}

export const ETHIC_STAGE_CANVAS_PASS_NAME = 'stage-canvas';

/**
 * Composite ready stage drawers into one uploaded canvas texture.
 *
 * The generic installer below remains useful while migrating individual
 * passes. The browser bridge uses this compositor to avoid uploading one
 * full-size texture for every logical stage layer.
 */
export function installEthicStageCanvasBridge(options: EthicCanvasBridgeOptions) {
  const orderedDrawers = ETHIC_PIXI_BRIDGE_PASSES.flatMap((descriptor) => {
    const draw = options.drawers[descriptor.name as EthicCanvasBridgePassName];
    return draw ? [{ descriptor, draw }] : [];
  });

  return createCanvasTexturePass(options.runtime, {
    PIXI: options.PIXI,
    name: ETHIC_STAGE_CANVAS_PASS_NAME,
    layer: 'world',
    order: 0,
    draw: (context, frame) => {
      for (const { draw } of orderedDrawers) draw(context, frame);
    },
    ...(options.canvasFactory ? { canvasFactory: options.canvasFactory } : {}),
  });
}

/**
 * Install only the already-isolated Canvas2D fight passes.
 *
 * Fighter and combat-VFX passes stay out of this adapter so their future native
 * Pixi implementation cannot accidentally inherit Canvas texture ownership.
 */
export function installEthicCanvasBridgePasses(options: EthicCanvasBridgeOptions) {
  const implementations: Record<string, ReturnType<typeof createCanvasTexturePassOptions>> = {};
  for (const descriptor of ETHIC_PIXI_BRIDGE_PASSES) {
    const draw = options.drawers[descriptor.name as EthicCanvasBridgePassName];
    if (!draw) continue;
    implementations[descriptor.name] = createCanvasTexturePassOptions({
      PIXI: options.PIXI,
      draw: (context, frame) => draw(context, frame),
      ...(options.canvasFactory ? { canvasFactory: options.canvasFactory } : {}),
    });
  }
  return installArcadeRenderPlan(options.runtime, ETHIC_PIXI_BRIDGE_PASSES, implementations);
}
