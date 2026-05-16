import { LEVEL_BONUSES, createExperienceState } from '@/game/progression/experience';
import { describe, expect, it } from 'vitest';

describe('experience state', () => {
  it('falls back to an empty bonus list when the initial bonus table entry is missing', () => {
    const originalBonus = LEVEL_BONUSES[0];

    try {
      (LEVEL_BONUSES as unknown as ({ bonus?: unknown } | undefined)[])[0] = undefined;
      expect(createExperienceState().bonuses).toEqual([]);
    } finally {
      (LEVEL_BONUSES as unknown as ({ bonus?: unknown } | undefined)[])[0] = originalBonus;
    }
  });
});
