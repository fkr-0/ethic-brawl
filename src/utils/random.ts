/**
 * Random number utilities with seeded random support
 */

/**
 * Create a seeded random number generator
 * Returns a function that produces deterministic random numbers between 0 and 1
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number, random = Math.random): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
export function randomFloat(min: number, max: number, random = Math.random): number {
  return random() * (max - min) + min;
}

/**
 * Random boolean with optional probability
 */
export function randomBool(probability = 0.5, random = Math.random): boolean {
  return random() < probability;
}

/**
 * Random element from an array
 */
export function randomElement<T>(array: readonly T[], random = Math.random): T | undefined {
  if (array.length === 0) return undefined;
  return array[randomInt(0, array.length - 1, random)];
}

/**
 * Random elements from an array without replacement
 */
export function randomElements<T>(array: readonly T[], count: number, random = Math.random): T[] {
  const copy = [...array];
  const result: T[] = [];
  const actualCount = Math.min(count, array.length);

  while (result.length < actualCount && copy.length > 0) {
    const index = randomInt(0, copy.length - 1, random);
    const [selected] = copy.splice(index, 1);
    if (selected !== undefined) {
      result.push(selected);
    }
  }

  return result;
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffle<T>(array: T[], random = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i, random);
    const current = result[i] as T;
    const swap = result[j] as T;
    result[i] = swap;
    result[j] = current;
  }
  return result;
}

/**
 * Weighted random selection
 */
export function weightedRandom<T>(
  items: readonly T[],
  weights: readonly number[],
  random = Math.random
): T | undefined {
  if (items.length === 0 || items.length !== weights.length) return undefined;

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) return undefined;

  let value = random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    value -= weights[i] ?? 0;
    if (value <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Random point in a circle
 */
export function randomPointInCircle(
  radius: number,
  random = Math.random
): { x: number; y: number } {
  const angle = random() * Math.PI * 2;
  const r = Math.sqrt(random()) * radius;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
  };
}

/**
 * Random angle in radians
 */
export function randomAngle(random = Math.random): number {
  return random() * Math.PI * 2;
}

/**
 * Random sign (-1 or 1)
 */
export function randomSign(random = Math.random): number {
  return random() < 0.5 ? -1 : 1;
}

/**
 * Generate a random ID string
 */
export function randomId(length = 8, random = Math.random): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(0, chars.length - 1, random)];
  }
  return result;
}

/**
 * Create a weighted pool for repeated random selections
 */
export class WeightedPool<T> {
  private items: { item: T; weight: number }[] = [];
  private totalWeight = 0;

  add(item: T, weight: number): this {
    this.items.push({ item, weight });
    this.totalWeight += weight;
    return this;
  }

  pick(random = Math.random): T | undefined {
    if (this.items.length === 0) return undefined;

    let value = random() * this.totalWeight;

    for (const entry of this.items) {
      value -= entry.weight;
      if (value <= 0) {
        return entry.item;
      }
    }

    return this.items[this.items.length - 1]?.item;
  }

  clear(): void {
    this.items = [];
    this.totalWeight = 0;
  }
}
