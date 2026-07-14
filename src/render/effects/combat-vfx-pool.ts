export type CombatParticleKind = 'spark' | 'guard' | 'special' | 'dust';

export interface HitSparkConfig {
  x: number;
  y: number;
  direction: 1 | -1;
  color: string;
  size: 'small' | 'medium' | 'large';
  type: 'hit' | 'block' | 'perfect_block' | 'special';
}

interface CombatParticle {
  active: boolean;
  kind: CombatParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  life: number;
  maxLife: number;
  size: number;
  stretch: number;
  rotation: number;
  spin: number;
  color: string;
}

export interface CombatVfxPoolStats {
  capacity: number;
  activeParticles: number;
  emittedParticles: number;
  emittedBursts: number;
  recycledParticles: number;
}

type RandomSource = () => number;

function createDormantParticle(): CombatParticle {
  return {
    active: false,
    kind: 'spark',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 0,
    drag: 1,
    life: 0,
    maxLife: 1,
    size: 1,
    stretch: 1,
    rotation: 0,
    spin: 0,
    color: '#FFFFFF',
  };
}

export class CombatVfxPool {
  private readonly particles: CombatParticle[];
  private cursor = 0;
  private emittedParticles = 0;
  private emittedBursts = 0;
  private recycledParticles = 0;

  constructor(
    private readonly capacity = 320,
    private readonly random: RandomSource = Math.random
  ) {
    this.particles = Array.from({ length: capacity }, createDormantParticle);
  }

  private acquire(): CombatParticle {
    for (let offset = 0; offset < this.capacity; offset += 1) {
      const index = (this.cursor + offset) % this.capacity;
      const particle = this.particles[index];
      if (!particle?.active) {
        this.cursor = (index + 1) % this.capacity;
        return particle ?? this.particles[0] ?? createDormantParticle();
      }
    }

    const particle = this.particles[this.cursor] ?? this.particles[0] ?? createDormantParticle();
    this.cursor = (this.cursor + 1) % this.capacity;
    this.recycledParticles += 1;
    return particle;
  }

  private spawn(config: Omit<CombatParticle, 'active'>): void {
    const particle = this.acquire();
    Object.assign(particle, config, { active: true });
    this.emittedParticles += 1;
  }

  emitImpact(config: HitSparkConfig): void {
    const count =
      config.type === 'special'
        ? 24
        : config.type === 'perfect_block'
          ? 16
          : config.size === 'large'
            ? 13
            : config.size === 'medium'
              ? 9
              : 6;
    const kind: CombatParticleKind =
      config.type === 'special'
        ? 'special'
        : config.type === 'perfect_block' || config.type === 'block'
          ? 'guard'
          : 'spark';
    const baseSpeed = config.size === 'large' ? 7.5 : config.size === 'medium' ? 5.6 : 4.2;
    const spread = config.type === 'perfect_block' ? Math.PI * 2 : Math.PI * 0.95;
    const baseAngle = config.direction > 0 ? 0 : Math.PI;

    this.emittedBursts += 1;
    for (let index = 0; index < count; index += 1) {
      const angle =
        config.type === 'perfect_block'
          ? this.random() * Math.PI * 2
          : baseAngle + (this.random() - 0.5) * spread;
      const speed = baseSpeed * (0.55 + this.random() * 0.75);
      const life = 15 + this.random() * (kind === 'special' ? 18 : 11);
      const useWhiteCore = index % 4 === 0;
      this.spawn({
        kind,
        x: config.x,
        y: config.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (kind === 'special' ? 1.5 : 0.4),
        gravity: kind === 'guard' ? 0.04 : 0.16,
        drag: kind === 'special' ? 0.975 : 0.94,
        life,
        maxLife: life,
        size: 1.6 + this.random() * (config.size === 'large' ? 4.5 : 3.2),
        stretch: 1.8 + this.random() * (kind === 'special' ? 4.2 : 2.4),
        rotation: angle,
        spin: (this.random() - 0.5) * 0.2,
        color: useWhiteCore ? '#FFFFFF' : config.color,
      });
    }
  }

  emitLandingDust(x: number, y: number, color: string, intensity = 1): void {
    const count = Math.max(8, Math.round(12 * intensity));
    this.emittedBursts += 1;
    for (let index = 0; index < count; index += 1) {
      const direction = index % 2 === 0 ? -1 : 1;
      const speed = (0.8 + this.random() * 2.8) * intensity;
      const life = 20 + this.random() * 18;
      this.spawn({
        kind: 'dust',
        x: x + (this.random() - 0.5) * 18,
        y: y - this.random() * 5,
        vx: direction * speed,
        vy: -(0.35 + this.random() * 1.8),
        gravity: 0.035,
        drag: 0.92,
        life,
        maxLife: life,
        size: 3 + this.random() * 6,
        stretch: 1.4 + this.random() * 1.8,
        rotation: this.random() * Math.PI,
        spin: (this.random() - 0.5) * 0.04,
        color,
      });
    }
  }

  update(): void {
    for (const particle of this.particles) {
      if (!particle.active) continue;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= particle.drag;
      particle.vy = particle.vy * particle.drag + particle.gravity;
      particle.rotation += particle.spin;
      particle.life -= 1;
      if (particle.life <= 0) particle.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const particle of this.particles) {
      if (!particle.active) continue;
      const lifeRatio = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = Math.min(1, lifeRatio * (particle.kind === 'dust' ? 0.55 : 1.2));
      ctx.fillStyle = particle.color;
      ctx.strokeStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.kind === 'special' ? 16 : particle.kind === 'dust' ? 0 : 8;

      if (particle.kind === 'dust') {
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          particle.size * particle.stretch * lifeRatio,
          particle.size * 0.55 * lifeRatio,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        ctx.lineWidth = Math.max(1, particle.size * 0.65 * lifeRatio);
        ctx.beginPath();
        ctx.moveTo(-particle.size * 0.4, 0);
        ctx.lineTo(particle.size * particle.stretch * lifeRatio, 0);
        ctx.stroke();
        if (particle.kind === 'special') {
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }

  clear(): void {
    for (const particle of this.particles) particle.active = false;
  }

  getStats(): CombatVfxPoolStats {
    return {
      capacity: this.capacity,
      activeParticles: this.particles.reduce(
        (count, particle) => count + Number(particle.active),
        0
      ),
      emittedParticles: this.emittedParticles,
      emittedBursts: this.emittedBursts,
      recycledParticles: this.recycledParticles,
    };
  }
}
