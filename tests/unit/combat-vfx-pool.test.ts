import { CombatVfxPool } from '@/render/effects/combat-vfx-pool';
import { describe, expect, it } from 'vitest';

const deterministicRandom = () => 0.5;

describe('combat VFX pool', () => {
  it('reuses a fixed particle capacity instead of allocating per burst', () => {
    const pool = new CombatVfxPool(8, deterministicRandom);

    pool.emitImpact({
      x: 100,
      y: 200,
      direction: 1,
      color: '#FFAA00',
      size: 'large',
      type: 'hit',
    });

    const stats = pool.getStats();
    expect(stats.capacity).toBe(8);
    expect(stats.activeParticles).toBe(8);
    expect(stats.emittedParticles).toBe(13);
    expect(stats.emittedBursts).toBe(1);
    expect(stats.recycledParticles).toBe(5);
  });

  it('expires particles in place and can be cleared between rounds', () => {
    const pool = new CombatVfxPool(24, deterministicRandom);
    pool.emitLandingDust(120, 400, '#D0B080', 1);
    expect(pool.getStats().activeParticles).toBeGreaterThan(0);

    for (let frame = 0; frame < 50; frame += 1) pool.update();
    expect(pool.getStats().activeParticles).toBe(0);

    pool.emitLandingDust(120, 400, '#D0B080', 1);
    pool.clear();
    expect(pool.getStats().activeParticles).toBe(0);
  });
});
