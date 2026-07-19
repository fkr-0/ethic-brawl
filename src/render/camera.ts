/**
 * Camera and viewport management
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';
import type { Vector2 } from '@/utils/math';
import { createCameraRig, type CameraRig } from '../../vendor/arcade-runtime.mjs';

/**
 * Camera configuration
 */
export interface CameraConfig {
  x: number;
  y: number;
  zoom: number;
  minX: number;
  maxX: number;
  followSpeed: number;
  shakeDecay: number;
}

/**
 * Camera state
 */
export interface Camera extends CameraRig {
  shakeOffsetX: number;
  shakeOffsetY: number;
}

/**
 * Default camera config
 */
const DEFAULT_CONFIG: CameraConfig = {
  x: CANVAS_WIDTH / 2,
  y: CANVAS_HEIGHT / 2,
  zoom: 1,
  minX: CANVAS_WIDTH / 2,
  maxX: CANVAS_WIDTH / 2,
  followSpeed: 0.1,
  shakeDecay: 0.9,
};

/**
 * Create a camera
 */
export function createCamera(config: Partial<CameraConfig> = {}): Camera {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const camera = createCameraRig({
    x: cfg.x,
    y: cfg.y,
    zoom: cfg.zoom,
    targetX: cfg.x,
    targetY: cfg.y,
  }) as Camera;
  Object.defineProperties(camera, {
    shakeOffsetX: {
      enumerable: true,
      get: () => camera.shakeX,
      set: (value: number) => {
        camera.shakeX = value;
      },
    },
    shakeOffsetY: {
      enumerable: true,
      get: () => camera.shakeY,
      set: (value: number) => {
        camera.shakeY = value;
      },
    },
  });
  return camera;
}

/**
 * Set camera target
 */
export function setCameraTarget(camera: Camera, x: number, y: number): void {
  camera.target(x, y);
}

/**
 * Follow multiple targets (average position)
 */
export function cameraFollowTargets(camera: Camera, targets: Vector2[]): void {
  camera.follow(targets);
}

/**
 * Apply shake effect
 */
export function shakeCamera(camera: Camera, intensity: number): void {
  camera.addShake(intensity);
}

/**
 * Update camera
 */
export function updateCamera(camera: Camera, config: Partial<CameraConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  camera.step(1, {
    followBlend: cfg.followSpeed,
    minX: cfg.minX,
    maxX: cfg.maxX,
    zoomTarget: cfg.zoom,
    zoomBlend: 0.16,
    shakeDecayMultiplier: cfg.shakeDecay,
    shakeEpsilon: 0.1,
  });
}

export function applyFightCameraEffects(
  camera: Camera,
  effects: Array<{ shake: number; zoomDelta: number; ttl: number; totalTtl: number }>
): void {
  let maxZoom = 1;

  for (const effect of effects) {
    const intensity = effect.ttl / Math.max(1, effect.totalTtl);
    if (effect.shake > 0) {
      shakeCamera(camera, effect.shake * intensity);
    }
    if (effect.zoomDelta > 0) {
      maxZoom = Math.max(maxZoom, 1 + effect.zoomDelta * intensity);
    }
  }

  camera.zoom = Math.max(camera.zoom, maxZoom);
}

/**
 * Get camera transform for rendering
 */
export function getCameraTransform(camera: Camera): {
  offsetX: number;
  offsetY: number;
  scale: number;
} {
  return {
    offsetX: -camera.x + CANVAS_WIDTH / 2,
    offsetY: -camera.y + CANVAS_HEIGHT / 2,
    scale: camera.zoom,
  };
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(camera: Camera, screenX: number, screenY: number): Vector2 {
  const transform = getCameraTransform(camera);
  return {
    x: screenX - transform.offsetX,
    y: screenY - transform.offsetY,
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(camera: Camera, worldX: number, worldY: number): Vector2 {
  const transform = getCameraTransform(camera);
  return {
    x: worldX + transform.offsetX,
    y: worldY + transform.offsetY,
  };
}

/**
 * Check if a point is visible on screen
 */
export function isPointVisible(camera: Camera, x: number, y: number, margin = 0): boolean {
  const screenPos = worldToScreen(camera, x, y);
  return (
    screenPos.x >= -margin &&
    screenPos.x <= CANVAS_WIDTH + margin &&
    screenPos.y >= -margin &&
    screenPos.y <= CANVAS_HEIGHT + margin
  );
}

/**
 * Check if a rectangle is visible on screen
 */
export function isRectVisible(
  camera: Camera,
  x: number,
  y: number,
  width: number,
  height: number,
  margin = 0
): boolean {
  return (
    isPointVisible(camera, x, y, margin) ||
    isPointVisible(camera, x + width, y, margin) ||
    isPointVisible(camera, x, y + height, margin) ||
    isPointVisible(camera, x + width, y + height, margin)
  );
}
