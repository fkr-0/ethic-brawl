/**
 * Particle system for visual effects
 */

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  decay: number;
  gravity?: number;
}

export class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public size: number;
  public color: string;
  public decay: number;
  public gravity: number;
  public alive = true;

  constructor(config: ParticleConfig) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.life = config.life;
    this.maxLife = config.maxLife;
    this.size = config.size;
    this.color = config.color;
    this.decay = config.decay;
    this.gravity = config.gravity ?? 0;
  }

  update(): void {
    if (!this.alive) return;

    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;

    if (this.life <= 0) {
      this.alive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 500;

  constructor(maxParticles = 500) {
    this.maxParticles = maxParticles;
  }

  /**
   * Emit particles from a point
   */
  emit(config: {
    x: number;
    y: number;
    count: number;
    speed: number;
    spread: number;
    size: number;
    color: string;
    life: number;
    gravity?: number;
  }): void {
    for (let i = 0; i < config.count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // Remove oldest particle
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = config.speed * (0.5 + Math.random() * 0.5);

      this.particles.push(
        new Particle({
          x: config.x,
          y: config.y,
          vx: Math.cos(angle) * speed * config.spread,
          vy: Math.sin(angle) * speed * config.spread,
          life: config.life,
          maxLife: config.life,
          size: config.size * (0.5 + Math.random() * 0.5),
          color: config.color,
          decay: 1,
          gravity: config.gravity ?? 0,
        })
      );
    }
  }

  /**
   * Emit a burst of particles
   */
  burst(config: {
    x: number;
    y: number;
    count: number;
    colors: string[];
    minSpeed: number;
    maxSpeed: number;
    minSize: number;
    maxSize: number;
    life: number;
  }): void {
    for (let i = 0; i < config.count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);

      this.particles.push(
        new Particle({
          x: config.x,
          y: config.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: config.life,
          maxLife: config.life,
          size: config.minSize + Math.random() * (config.maxSize - config.minSize),
          color: config.colors[Math.floor(Math.random() * config.colors.length)] || '#FFFFFF',
          decay: 1 + Math.random(),
          gravity: 0.1,
        })
      );
    }
  }

  update(): void {
    for (const particle of this.particles) {
      particle.update();
    }

    // Remove dead particles
    this.particles = this.particles.filter((p) => p.alive);
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  clear(): void {
    this.particles = [];
  }
}

/**
 * Create hit spark particles
 */
export function createHitSparkParticles(
  x: number,
  y: number,
  color = '#FFFF00',
  count = 10
): ParticleSystem {
  const system = new ParticleSystem(100);
  system.burst({
    x,
    y,
    count,
    colors: [color, '#FFFFFF'],
    minSpeed: 2,
    maxSpeed: 8,
    minSize: 2,
    maxSize: 5,
    life: 20,
  });
  return system;
}

/**
 * Create dust particles for landing
 */
export function createLandingDust(x: number, y: number, color = '#8B4513'): ParticleSystem {
  const system = new ParticleSystem(50);
  system.emit({
    x,
    y,
    count: 15,
    speed: 1,
    spread: 0.5,
    size: 4,
    color,
    life: 30,
    gravity: 0.05,
  });
  return system;
}
