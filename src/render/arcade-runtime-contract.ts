/**
 * Stable mapping from Ethic Brawl's existing canvas passes to the shared PixiJS runtime.
 *
 * This keeps scene/gameplay code renderer-neutral while passes migrate independently.
 */
import { ARCADE_RUNTIME_VERSION } from '@arcade/runtime/core';
import { defineArcadeRenderPlan } from '@arcade/runtime/pixi';

export const ETHIC_ARCADE_RUNTIME_VERSION = ARCADE_RUNTIME_VERSION;

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
      migration: 'native',
      activation: 'ready',
    },
    {
      name: 'stage-depth',
      layer: 'world-back',
      legacyPass: 'stageDepth',
      migration: 'native',
      activation: 'ready',
    },
    {
      name: 'arena',
      layer: 'world',
      legacyPass: 'arena',
      migration: 'native',
      activation: 'ready',
    },
    {
      name: 'fighters',
      layer: 'actors',
      legacyPass: 'fighters',
      migration: 'native',
      activation: 'ready',
      required: true,
    },
    {
      name: 'projectiles',
      layer: 'projectiles',
      legacyPass: 'projectiles',
      migration: 'native',
      activation: 'ready',
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
      activation: 'planned',
    },
    {
      name: 'fight-hud',
      layer: 'hud',
      legacyPass: 'fightHud',
      migration: 'native',
      activation: 'ready',
    },
    {
      name: 'scene-ui',
      layer: 'overlay',
      legacyPass: 'sceneUi',
      migration: 'canvas-bridge',
      activation: 'planned',
    },
  ] as const,
  { layers: ETHIC_PIXI_LAYERS }
);

export const ETHIC_PIXI_BRIDGE_PASSES = [] as readonly (typeof ETHIC_PIXI_RENDER_PLAN)[number][];
