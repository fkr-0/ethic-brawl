import { applyStatusEffect, hasStatusEffect, tickStatusEffects } from '@/game/specials';
import { describe, expect, it } from 'vitest';

describe('status effect primitives', () => {
  it('burn damage ticks on schedule', () => {
    let effects = applyStatusEffect(
      [],
      { id: 'burn', durationFrames: 10, magnitude: 3, tickRate: 2 },
      'fire'
    );
    expect(tickStatusEffects(effects).damage).toBe(0);
    effects = tickStatusEffects(effects).effects;
    expect(tickStatusEffects(effects).damage).toBe(3);
  });

  it('slow/freeze reduce movement and silence blocks command specials', () => {
    let effects = applyStatusEffect(
      [],
      { id: 'slow', durationFrames: 5, magnitude: 0.25 },
      'field'
    );
    effects = applyStatusEffect(
      effects,
      { id: 'silence', durationFrames: 5, magnitude: 1 },
      'field'
    );
    const tick = tickStatusEffects(effects);

    expect(tick.movementMultiplier).toBeLessThan(1);
    expect(tick.canUseCommandSpecials).toBe(false);
  });

  it('armor and reflect expose defensive flags', () => {
    let effects = applyStatusEffect([], { id: 'armor', durationFrames: 5, magnitude: 2 }, 'buff');
    effects = applyStatusEffect(
      effects,
      { id: 'reflect', durationFrames: 5, magnitude: 1 },
      'buff'
    );
    const tick = tickStatusEffects(effects);

    expect(tick.armorHits).toBe(2);
    expect(tick.reflectsProjectiles).toBe(true);
    expect(hasStatusEffect(tick.effects, 'reflect')).toBe(true);
  });
});
