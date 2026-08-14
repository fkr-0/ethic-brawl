import { resolveEthicProjectileVisual } from '@/render/ethic-pixi-combat';
import { describe, expect, it } from 'vitest';

describe('Ethic native Pixi combat models', () => {
  it('derives deterministic projectile presentation without mutating simulation state', () => {
    const projectile = {
      id: 'beam:p1',
      ownerId: 'p1',
      x: 120,
      y: 90,
      lane: 1,
      facing: 'left' as const,
      ageFrames: 10,
      remainingPierce: 0,
      reflected: false,
      definition: {
        id: 'beam',
        kind: 'laser' as const,
        speedX: 8,
        speedY: 0,
        accelerationX: 0,
        accelerationY: 0,
        lifetimeFrames: 60,
        pierceCount: 0,
        bounceCount: 0,
        laneBehavior: 'same_lane' as const,
        collision: 'ray' as const,
        gravityScale: 0,
      },
    };
    const visual = resolveEthicProjectileVisual(projectile);
    expect(visual).toMatchObject({ x: 120, y: 90, kind: 'laser', rotation: Math.PI });
    expect(visual.alpha).toBeGreaterThan(0.8);
    expect(projectile.ageFrames).toBe(10);
  });
});
