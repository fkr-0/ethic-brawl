/**
 * Lane positioning logic
 */

import { CANVAS_HEIGHT, LANE_COUNT } from '@/app/config';
import { clamp } from '@/utils/math';

/**
 * Lane type (0 = front, 1 = middle, 2 = back)
 */
export type Lane = 0 | 1 | 2;

/**
 * Lane Y positions on screen
 */
export const LANE_POSITIONS: readonly [number, number, number] = [
  CANVAS_HEIGHT - 120, // Front (closest to camera)
  CANVAS_HEIGHT - 170, // Middle
  CANVAS_HEIGHT - 220, // Back (farthest from camera)
];

/**
 * Get the Y position for a lane
 */
export function getLaneY(lane: Lane): number {
  return LANE_POSITIONS[lane];
}

/**
 * Check if a lane is valid
 */
export function isValidLane(lane: number): lane is Lane {
  return lane >= 0 && lane < LANE_COUNT;
}

/**
 * Get adjacent lanes
 */
export function getAdjacentLanes(lane: Lane): { up: Lane | null; down: Lane | null } {
  return {
    up: lane < 2 ? ((lane + 1) as Lane) : null,
    down: lane > 0 ? ((lane - 1) as Lane) : null,
  };
}

/**
 * Calculate lane change progress (for animation)
 */
export function calculateLaneTransition(
  currentLane: Lane,
  targetLane: Lane,
  progress: number
): number {
  if (currentLane === targetLane) return getLaneY(currentLane);

  const currentY = getLaneY(currentLane);
  const targetY = getLaneY(targetLane);
  const clampedProgress = clamp(progress, 0, 1);

  return currentY + (targetY - currentY) * clampedProgress;
}

/**
 * Get the lane at a given Y position
 */
export function getLaneFromY(y: number): Lane {
  let closestLane: Lane = 1;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const [index, laneY] of LANE_POSITIONS.entries()) {
    const distance = Math.abs(y - laneY);
    if (distance < minDistance) {
      minDistance = distance;
      closestLane = index as Lane;
    }
  }

  return closestLane;
}

/**
 * Check if two lanes are adjacent
 */
export function areLanesAdjacent(lane1: Lane, lane2: Lane): boolean {
  return Math.abs(lane1 - lane2) <= 1;
}

/**
 * Get lane depth factor (for rendering order and scale)
 * Front lane is larger, back lane is smaller
 */
export function getLaneDepthFactor(lane: Lane): number {
  // Front = 1.0, Back = 0.85
  return 1 - lane * 0.075;
}

/**
 * Get render order for a lane (higher = render later = on top)
 */
export function getLaneRenderOrder(lane: Lane): number {
  // Front lane should be rendered on top
  return LANE_COUNT - lane;
}
