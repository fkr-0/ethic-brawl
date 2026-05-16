import { randomElements, weightedRandom } from '@/utils/random';
import { describe, expect, it } from 'vitest';

describe('random utilities robustness', () => {
  it('ignores sparse array holes when selecting random elements', () => {
    const items = ['alpha', 'beta'];
    items[1] = undefined as unknown as string;

    expect(randomElements(items, 2, () => 0)).toEqual(['alpha']);
  });

  it('returns undefined when total weight is not positive', () => {
    expect(weightedRandom(['alpha', 'beta'], [0, 0], () => 0.5)).toBeUndefined();
  });
});
