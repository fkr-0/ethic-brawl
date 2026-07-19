import {
  createCanvasTexturePassOptions,
  installArcadeRenderPlan,
} from '../../vendor/arcade-pixi-runtime.mjs';
import type {
  ArcadePixiFrame,
  ArcadePixiNamespace,
  ArcadePixiRuntime,
} from '../../vendor/arcade-pixi-runtime.mjs';
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
