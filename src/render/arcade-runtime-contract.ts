/**
 * Stable mapping from Ethic Brawl's existing canvas passes to the shared PixiJS runtime.
 *
 * This keeps scene/gameplay code renderer-neutral while passes migrate independently.
 */
import { defineArcadeRenderPlan } from '../../vendor/arcade-pixi-runtime.mjs';

// Ethic pins the shared Pixi runtime used by the composite Canvas bridge.
// Keep this synchronized with the vendored metadata and checksum contract.
export const ETHIC_ARCADE_PIXI_RUNTIME_VERSION = '0.7.0';

export const ETHIC_PIXI_LAYERS = [
  'backdrop',
  'world-back',
  'world',
  'actors',
  'projectiles',
  'effects',
  'world-front',
  'hud',
  'overlay',
] as const;

export const ETHIC_CANVAS_PASS_TO_PIXI_LAYER = {
  background: 'backdrop',
  stageDepth: 'world-back',
  arena: 'world',
  fighters: 'actors',
  projectiles: 'projectiles',
  combatVfx: 'effects',
  foreground: 'world-front',
  fightHud: 'hud',
  sceneUi: 'overlay',
} as const;

export const ETHIC_PIXI_RENDER_PLAN = defineArcadeRenderPlan(
  [
    {
      name: 'background',
      layer: 'backdrop',
      legacyPass: 'background',
      migration: 'canvas-bridge',
      activation: 'ready',
    },
    {
      name: 'stage-depth',
      layer: 'world-back',
      legacyPass: 'stageDepth',
      migration: 'canvas-bridge',
      activation: 'ready',
    },
    {
      name: 'arena',
      layer: 'world',
      legacyPass: 'arena',
      migration: 'canvas-bridge',
      activation: 'ready',
    },
    {
      name: 'fighters',
      layer: 'actors',
      legacyPass: 'fighters',
      migration: 'native',
      activation: 'planned',
      required: true,
    },
    {
      name: 'projectiles',
      layer: 'projectiles',
      legacyPass: 'projectiles',
      migration: 'native',
      activation: 'planned',
    },
    {
      name: 'combat-vfx',
      layer: 'effects',
      legacyPass: 'combatVfx',
      migration: 'native',
      activation: 'planned',
    },
    {
      name: 'foreground',
      layer: 'world-front',
      legacyPass: 'foreground',
      migration: 'canvas-bridge',
      activation: 'ready',
    },
    {
      name: 'fight-hud',
      layer: 'hud',
      legacyPass: 'fightHud',
      migration: 'canvas-bridge',
      activation: 'ready',
    },
    {
      name: 'scene-ui',
      layer: 'overlay',
      legacyPass: 'sceneUi',
      migration: 'canvas-bridge',
      activation: 'ready',
    },
  ] as const,
  { layers: ETHIC_PIXI_LAYERS }
);

export const ETHIC_PIXI_BRIDGE_PASSES = ETHIC_PIXI_RENDER_PLAN.filter(
  (pass) => pass.migration === 'canvas-bridge' && pass.activation === 'ready'
);
