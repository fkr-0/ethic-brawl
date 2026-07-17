/**
 * Stable mapping from Ethic Brawl's existing canvas passes to the shared PixiJS runtime.
 *
 * This keeps scene/gameplay code renderer-neutral while passes migrate independently.
 */
export const ETHIC_ARCADE_PIXI_RUNTIME_VERSION = '0.2.0';

export const ETHIC_PIXI_LAYERS = [
  'backdrop',
  'world-back',
  'world',
  'actors',
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
  combatVfx: 'effects',
  foreground: 'world-front',
  fightHud: 'hud',
  sceneUi: 'overlay',
} as const;
