/**
 * Math utility functions
 */

/**
 * 2D Vector type
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Axis-Aligned Bounding Box
 */
export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Inverse linear interpolation - find t given value
 */
export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return clamp((value - a) / (b - a), 0, 1);
}

/**
 * Remap a value from one range to another
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}

/**
 * Calculate distance between two points
 */
export function distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster, no sqrt)
 */
export function distanceSquared(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate Manhattan distance
 */
export function manhattanDistance(a: Vector2, b: Vector2): number {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

/**
 * Normalize a vector to unit length
 */
export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * Get the length of a vector
 */
export function length(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Add two vectors
 */
export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Subtract vector b from vector a
 */
export function subtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Multiply a vector by a scalar
 */
export function multiply(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Dot product of two vectors
 */
export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Create a vector
 */
export function vec(x: number, y: number): Vector2 {
  return { x, y };
}

/**
 * Zero vector
 */
export const ZERO_VECTOR: Vector2 = { x: 0, y: 0 };

/**
 * Check if a point is inside an AABB
 */
export function pointInAABB(point: Vector2, box: AABB): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/**
 * Check if two AABBs intersect
 */
export function aabbIntersects(a: AABB, b: AABB): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/**
 * Get the center of an AABB
 */
export function aabbCenter(box: AABB): Vector2 {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * Sign function - returns -1, 0, or 1
 */
export function sign(value: number): number {
  if (value > 0) return 1;
  if (value < 0) return -1;
  return 0;
}

/**
 * Move towards a target value by a maximum delta
 */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }
  return current + sign(target - current) * maxDelta;
}

/**
 * Smooth step interpolation
 */
export function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Easing function - ease in quad
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Easing function - ease out quad
 */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * Easing function - ease in out quad
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Wrap a value around a range
 */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  return min + ((((value - min) % range) + range) % range);
}

/**
 * Ping pong between 0 and length
 */
export function pingPong(t: number, length: number): number {
  t = wrap(t, 0, length * 2);
  return length - Math.abs(t - length);
}
