import type { ProjectileDefinition } from '@/content/specials';
import { resolveHitboxContacts } from '../../../vendor/arcade-runtime.mjs';

export interface ProjectileState {
  id: string;
  definition: ProjectileDefinition;
  ownerId: string;
  x: number;
  y: number;
  lane: number;
  facing: 'left' | 'right';
  ageFrames: number;
  remainingPierce: number;
  reflected: boolean;
}

export interface ProjectileTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  ownerId?: string;
}

export function spawnProjectile(
  definition: ProjectileDefinition,
  ownerId: string,
  x: number,
  y: number,
  lane: number,
  facing: 'left' | 'right'
): ProjectileState {
  return {
    id: `${definition.id}_${ownerId}`,
    definition,
    ownerId,
    x,
    y,
    lane,
    facing,
    ageFrames: 0,
    remainingPierce: definition.pierceCount,
    reflected: false,
  };
}

export function updateProjectile(projectile: ProjectileState): ProjectileState | null {
  const direction = projectile.facing === 'right' ? 1 : -1;
  const nextAge = projectile.ageFrames + 1;
  if (nextAge > projectile.definition.lifetimeFrames) return null;

  return {
    ...projectile,
    ageFrames: nextAge,
    x:
      projectile.x +
      projectile.definition.speedX * direction +
      projectile.definition.accelerationX * nextAge * direction,
    y:
      projectile.y +
      projectile.definition.speedY +
      projectile.definition.accelerationY * nextAge +
      projectile.definition.gravityScale * nextAge,
  };
}

export function projectileHitsTarget(
  projectile: ProjectileState,
  target: ProjectileTarget
): boolean {
  if (target.ownerId === projectile.ownerId) return false;
  if (projectile.definition.laneBehavior === 'same_lane' && target.lane !== projectile.lane)
    return false;
  if (
    projectile.definition.laneBehavior === 'adjacent_arc' &&
    Math.abs(target.lane - projectile.lane) > 1
  )
    return false;
  if (projectile.definition.collision === 'ray')
    return target.lane === projectile.lane && isAhead(projectile, target.x);

  return (
    resolveHitboxContacts({
      hitboxes: [
        {
          id: projectile.id,
          ownerId: projectile.ownerId,
          x: projectile.x,
          y: projectile.y,
          width: 16,
          height: 16,
        },
      ],
      hurtboxes: [
        {
          id: `target:${target.id}`,
          actorId: target.id,
          x: target.x,
          y: target.y,
          width: target.width,
          height: target.height,
        },
      ],
    }).length > 0
  );
}

export function reflectProjectile(
  projectile: ProjectileState,
  newOwnerId: string
): ProjectileState {
  return {
    ...projectile,
    ownerId: newOwnerId,
    facing: projectile.facing === 'right' ? 'left' : 'right',
    reflected: true,
  };
}

export function updateSeekingProjectile(
  projectile: ProjectileState,
  targets: readonly ProjectileTarget[]
): ProjectileState | null {
  const homingStrength = projectile.definition.homingStrength ?? 0;
  if (homingStrength <= 0) return updateProjectile(projectile);

  const target = targets
    .filter((candidate) => candidate.ownerId !== projectile.ownerId)
    .reduce<ProjectileTarget | null>((best, candidate) => {
      if (!best) return candidate;
      const bestDistance = squaredDistance(projectile, best);
      const candidateDistance = squaredDistance(projectile, candidate);
      return candidateDistance < bestDistance ? candidate : best;
    }, null);

  if (!target) return updateProjectile(projectile);

  const direction = projectile.facing === 'right' ? 1 : -1;
  const desiredX = Math.sign(target.x - projectile.x) || direction;
  const desiredY = Math.sign(target.y - projectile.y) || 0;

  return updateProjectile({
    ...projectile,
    definition: {
      ...projectile.definition,
      speedX: projectile.definition.speedX + desiredX * homingStrength,
      speedY: projectile.definition.speedY + desiredY * homingStrength,
    },
  });
}

function squaredDistance(projectile: ProjectileState, target: ProjectileTarget): number {
  return (target.x - projectile.x) ** 2 + (target.y - projectile.y) ** 2;
}

function isAhead(projectile: ProjectileState, targetX: number): boolean {
  return projectile.facing === 'right' ? targetX >= projectile.x : targetX <= projectile.x;
}
