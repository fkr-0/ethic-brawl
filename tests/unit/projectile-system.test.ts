import { getSpecialByCommandSlot } from '@/content/specials';
import {
  projectileHitsTarget,
  reflectProjectile,
  spawnProjectile,
  updateProjectile,
} from '@/game/specials';
import { describe, expect, it } from 'vitest';

function requireProjectile(
  characterId: Parameters<typeof getSpecialByCommandSlot>[0],
  slot: Parameters<typeof getSpecialByCommandSlot>[1]
) {
  const projectile = getSpecialByCommandSlot(characterId, slot)?.projectile;
  expect(projectile).toBeDefined();
  if (!projectile) {
    throw new Error(`Missing projectile for ${characterId} ${slot}`);
  }
  return projectile;
}

describe('projectile primitives', () => {
  it('moves magic balls and expires them deterministically', () => {
    const projectileDef = requireProjectile('leibniz', 'BFA');

    const projectile = spawnProjectile(projectileDef, 'p1', 0, 0, 1, 'right');
    const updated = updateProjectile(projectile);

    expect(updated?.x).toBe(projectileDef?.speedX);
    let current = projectile;
    for (let i = 0; i < projectileDef?.lifetimeFrames; i += 1) {
      const next = updateProjectile(current);
      if (!next) break;
      current = next;
    }
    expect(updateProjectile(current)).toBeNull();
  });

  it('ray projectiles hit ahead in the same lane', () => {
    const projectileDef = requireProjectile('diogenes', 'BFA');
    const projectile = spawnProjectile(projectileDef, 'p1', 10, 0, 1, 'right');

    expect(
      projectileHitsTarget(projectile, {
        id: 'p2',
        ownerId: 'p2',
        x: 200,
        y: 0,
        width: 40,
        height: 80,
        lane: 1,
      })
    ).toBe(true);
    expect(
      projectileHitsTarget(projectile, {
        id: 'p3',
        ownerId: 'p3',
        x: 200,
        y: 0,
        width: 40,
        height: 80,
        lane: 2,
      })
    ).toBe(false);
  });

  it('reflect swaps owner and direction', () => {
    const projectileDef = requireProjectile('camus', 'BFA');
    const projectile = spawnProjectile(projectileDef, 'p1', 10, 0, 1, 'right');
    const reflected = reflectProjectile(projectile, 'p2');

    expect(reflected.ownerId).toBe('p2');
    expect(reflected.facing).toBe('left');
    expect(reflected.reflected).toBe(true);
  });
});
