/**
 * Collision detection utilities
 */

import type { AABB, Vector2 } from '@/utils/math';
import { aabbOverlap, computeCollisionManifold } from '../../../vendor/arcade-runtime.mjs';

/**
 * Collision layers
 */
export type CollisionLayer = 'fighter' | 'hitbox' | 'projectile' | 'item' | 'environment';

/**
 * Collision info
 */
export interface CollisionInfo {
  a: AABB;
  b: AABB;
  overlapX: number;
  overlapY: number;
  normalX: number;
  normalY: number;
}

/**
 * Check collision between two AABBs
 */
export function checkCollision(a: AABB, b: AABB): boolean {
  return aabbOverlap(a, b);
}

/**
 * Get collision info between two AABBs
 */
export function getCollisionInfo(a: AABB, b: AABB): CollisionInfo | null {
  const manifold = computeCollisionManifold({ id: 'a', ...a }, { id: 'b', ...b });
  if (!manifold) return null;

  return {
    a,
    b,
    overlapX: manifold.overlapX,
    overlapY: manifold.overlapY,
    normalX: -manifold.normalX,
    normalY: -manifold.normalY,
  };
}

/**
 * Resolve collision by pushing A out of B
 */
export function resolveCollision(a: Vector2, info: CollisionInfo): Vector2 {
  if (info.overlapX < info.overlapY) {
    return {
      x: a.x + info.normalX * info.overlapX,
      y: a.y,
    };
  }
  return {
    x: a.x,
    y: a.y + info.normalY * info.overlapY,
  };
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(point: Vector2, rect: AABB): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if point is inside circle
 */
export function pointInCircle(point: Vector2, center: Vector2, radius: number): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Check line segment intersection
 */
export function lineIntersects(p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

function direction(pi: Vector2, pj: Vector2, pk: Vector2): number {
  return (pk.x - pi.x) * (pj.y - pi.y) - (pj.x - pi.x) * (pk.y - pi.y);
}

function onSegment(pi: Vector2, pj: Vector2, pk: Vector2): boolean {
  return (
    Math.min(pi.x, pj.x) <= pk.x &&
    pk.x <= Math.max(pi.x, pj.x) &&
    Math.min(pi.y, pj.y) <= pk.y &&
    pk.y <= Math.max(pi.y, pj.y)
  );
}
