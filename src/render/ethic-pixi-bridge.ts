import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
  TextureStyle,
} from 'pixi.js';
import {
  createArcadeCameraTransform,
  createArcadePixiRuntime,
  createBrowserPerformanceSampler,
} from '../../vendor/arcade-runtime.mjs';
import type { ArcadePixiNamespace } from '../../vendor/arcade-runtime.mjs';
import { ETHIC_PIXI_LAYERS } from './arcade-runtime-contract';
import { createEthicPixiHud } from './ethic-pixi-hud';
import { createEthicPixiCombat } from './ethic-pixi-combat';
import { createEthicPixiScenery } from './ethic-pixi-scenery';
import type { EthicPixiBridgeController, EthicPixiBridgeOptions } from './ethic-pixi-contract';
import type { FightPresentationOptions } from './fight-presentation';
import { resolveFightGraphicsProfile } from './fight-presentation';
import {
  createEthicHardwareBudgetMonitor,
  getBrowserHardwareProfile,
} from './renderer-hardware-budget';

const PIXI: ArcadePixiNamespace = {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
  TextureStyle,
};

export async function createEthicPixiBridge(
  options: EthicPixiBridgeOptions
): Promise<EthicPixiBridgeController> {
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
  const nativeScenery = createEthicPixiScenery({
    backdrop: runtime.layer('backdrop'),
    worldBack: runtime.layer('world-back'),
    world: runtime.layer('world'),
    worldFront: runtime.layer('world-front'),
    overlay: runtime.layer('overlay'),
    width: options.width,
    height: options.height,
  });
  const hardwareBudget = createEthicHardwareBudgetMonitor(getBrowserHardwareProfile());
  const performanceSampler = createBrowserPerformanceSampler({ refreshEverySamples: 120 });
  const hardwareWarmupFrames = 15;
  let activeFrames = 0;
  let previousTextureBytes = 0;
  let previousCreatedProjectiles = 0;
  const nativeCombat = createEthicPixiCombat({
    actors: runtime.layer('actors'),
    projectiles: runtime.layer('projectiles'),
  });
  const nativeHud = createEthicPixiHud({
    container: runtime.layer('hud'),
    width: options.width,
    height: options.height,
  });
  const cameraTransform = createArcadeCameraTransform({
    x: options.width / 2,
    y: options.height / 2,
    viewportWidth: options.width,
    viewportHeight: options.height,
    anchorX: 0.5,
    anchorY: 0.5,
  });

  const updateCameraTransform = () => {
    const camera = options.fightRuntime.getCamera();
    cameraTransform.set({
      zoom: camera.zoom,
      shakeX: camera.shakeOffsetX,
      shakeY: camera.shakeOffsetY,
    });
    cameraTransform.applyToContainer(runtime.layer('actors'));
    cameraTransform.applyToContainer(runtime.layer('projectiles'));
    cameraTransform.applyToContainer(runtime.layer('world-back'));
    cameraTransform.applyToContainer(runtime.layer('world'));
    cameraTransform.applyToContainer(runtime.layer('world-front'));
  };

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
      if (active) {
        activeFrames += 1;
        const frameStartedAt = performance.now();
        const state = options.fightRuntime.getState();
        if (state) {
          updateCameraTransform();
          const scenery = nativeScenery.update(
            state,
            options.fightRuntime.getCamera(),
            resolveFightGraphicsProfile(presentation),
            presentation.screenFeedbackScale ?? 1
          );
          const combat = nativeCombat.sync(state);
          const model = nativeHud.update(state, timeMs);
          canvas.dataset.nativeActors = 'true';
          canvas.dataset.nativeProjectiles = 'true';
          canvas.dataset.nativeScenery = 'true';
          canvas.dataset.nativeScreenFeedback = 'true';
          canvas.dataset.sceneryProfile = scenery.profileId;
          canvas.dataset.actorCount = String(combat.actors);
          canvas.dataset.projectileCount = String(combat.projectiles.active);
          canvas.dataset.nativeHud = 'true';
          canvas.dataset.hudTimer = model.timerText;
        }
        runtime.step(0, timeMs, true);
        const combatSnapshot = nativeCombat.snapshot();
        const textureDelta = Math.max(0, combatSnapshot.textureBytes - previousTextureBytes);
        const createdDelta = Math.max(
          0,
          combatSnapshot.projectiles.created - previousCreatedProjectiles
        );
        previousTextureBytes = combatSnapshot.textureBytes;
        previousCreatedProjectiles = combatSnapshot.projectiles.created;
        const performanceSample = performanceSampler.sample();
        hardwareBudget.setBundleBytes(performanceSample.bundleBytes);
        if (activeFrames > hardwareWarmupFrames) {
          hardwareBudget.record({
            frameMs: performance.now() - frameStartedAt,
            allocationBytes: createdDelta * 512,
            uploadBytes: textureDelta,
            heapBytes: performanceSample.heapBytes,
          });
        }
        const budget = hardwareBudget.evaluate() as {
          tier: string;
          pass: boolean;
          samples: number;
          budget: { minimumSamples?: number };
          summary: {
            frame: { mean: number; p95: number; max: number };
            upload: { p95: number };
            heap: { max: number };
          };
          violations: readonly { metric: string }[];
        };
        const warmed =
          activeFrames > hardwareWarmupFrames &&
          budget.samples >= (budget.budget.minimumSamples ?? 0);
        canvas.dataset.hardwareTier = budget.tier;
        canvas.dataset.hardwareBudget = warmed ? (budget.pass ? 'pass' : 'fail') : 'warming';
        canvas.dataset.hardwareSamples = String(budget.samples);
        canvas.dataset.hardwareFrameMeanMs = budget.summary.frame.mean.toFixed(2);
        canvas.dataset.hardwareFrameP95Ms = budget.summary.frame.p95.toFixed(2);
        canvas.dataset.hardwareFrameMaxMs = budget.summary.frame.max.toFixed(2);
        canvas.dataset.hardwareViolations = budget.violations
          .map((entry) => entry.metric)
          .join(',');
        canvas.dataset.uploadP95Bytes = String(Math.round(budget.summary.upload.p95));
        canvas.dataset.heapMaxBytes = String(Math.round(budget.summary.heap.max));
      }
    },
    snapshot: () => runtime.snapshot(),
    destroy: () => {
      nativeHud.destroy();
      nativeCombat.destroy();
      nativeScenery.destroy();
      runtime.destroy(true);
    },
  };
}
