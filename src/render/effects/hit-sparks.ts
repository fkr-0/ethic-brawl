/**
 * Hit spark effects for combat impacts
 */

import { ParticleSystem, createHitSparkParticles } from './particles';

export interface HitSparkConfig {
  x: number;
  y: number;
  direction: 1 | -1;
  color: string;
  size: 'small' | 'medium' | 'large';
  type: 'hit' | 'block' | 'perfect_block' | 'special';
}

/**
 * Create hit sparks effect
 */
export function createHitSparks(config: HitSparkConfig): ParticleSystem {
  const count =
    config.type === 'special'
      ? 20
      : config.type === 'perfect_block'
        ? 12
        : config.size === 'large'
          ? 10
          : config.size === 'medium'
            ? 8
            : 5;

  return createHitSparkParticles(config.x, config.y, config.color, count);
}

/**
 * Create impact burst effect
 */
export function createImpactBurst(
  x: number,
  y: number,
  color = '#FF00FF',
  radius = 30
): ParticleSystem {
  const system = new ParticleSystem(20);

  system.emit({
    x,
    y,
    count: 20,
    speed: radius / 8,
    spread: 1,
    size: 3,
    color,
    life: 25,
    gravity: 0.02,
  });

  return system;
}

/**
 * Create energy trail effect
 */
export function createEnergyTrail(
  points: { x: number; y: number }[],
  color = '#00F5FF'
): ParticleSystem {
  const system = new ParticleSystem(points.length * 2);

  for (const point of points) {
    system.emit({
      x: point.x,
      y: point.y,
      count: 2,
      speed: 0.5,
      spread: 0.3,
      size: 2,
      color,
      life: 20,
      gravity: -0.02,
    });
  }

  return system;
}
