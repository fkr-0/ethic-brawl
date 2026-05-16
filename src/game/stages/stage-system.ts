import type { AABB, Vector2 } from '@/utils/math';
import { aabbIntersects } from '@/utils/math';

export type StageSurfaceKind = 'floor' | 'platform' | 'wall' | 'hazard';
export type StageObstacleKind = 'solid' | 'jump_through' | 'pickup_blocker' | 'hazard';

export interface StageBounds {
  width: number;
  height: number;
}

export interface StageSurface extends AABB {
  id: string;
  kind: StageSurfaceKind;
  oneWay?: boolean;
}

export interface StageObstacle extends AABB {
  id: string;
  kind: StageObstacleKind;
  jumpable: boolean;
  damageOnTouch?: number;
}

export interface StageDefinition {
  id: string;
  name: string;
  bounds: StageBounds;
  spawnPoints: readonly Vector2[];
  surfaces: readonly StageSurface[];
  obstacles: readonly StageObstacle[];
  itemSpawnPoints: readonly Vector2[];
}

export const TRAINING_STAGE: StageDefinition = {
  id: 'training_box',
  name: 'Training Box',
  bounds: { width: 960, height: 540 },
  spawnPoints: [
    { x: 240, y: 420 },
    { x: 720, y: 420 },
  ],
  surfaces: [
    { id: 'floor', kind: 'floor', x: 0, y: 448, width: 960, height: 32 },
    { id: 'left_platform', kind: 'platform', x: 160, y: 330, width: 180, height: 18, oneWay: true },
    {
      id: 'right_platform',
      kind: 'platform',
      x: 620,
      y: 330,
      width: 180,
      height: 18,
      oneWay: true,
    },
  ],
  obstacles: [
    { id: 'crate_mid', kind: 'solid', x: 450, y: 392, width: 64, height: 56, jumpable: true },
  ],
  itemSpawnPoints: [
    { x: 300, y: 410 },
    { x: 480, y: 300 },
    { x: 660, y: 410 },
  ],
};

export interface StageBody extends AABB {
  velocityX: number;
  velocityY: number;
}

export interface StageStepResult {
  body: StageBody;
  grounded: boolean;
  standingOnId: string | null;
  touchedHazards: string[];
}

export function clampToStageBounds(body: StageBody, stage: StageDefinition): StageBody {
  return {
    ...body,
    x: Math.max(0, Math.min(stage.bounds.width - body.width, body.x)),
    y: Math.max(0, Math.min(stage.bounds.height - body.height, body.y)),
  };
}

export function resolveStageMovement(
  body: StageBody,
  previous: StageBody,
  stage: StageDefinition
): StageStepResult {
  let next = clampToStageBounds(body, stage);
  let grounded = false;
  let standingOnId: string | null = null;
  const touchedHazards: string[] = [];
  const solids: Array<StageSurface | StageObstacle> = [...stage.surfaces, ...stage.obstacles];

  for (const solid of solids) {
    if ('damageOnTouch' in solid && solid.damageOnTouch && aabbIntersects(next, solid)) {
      touchedHazards.push(solid.id);
    }

    const oneWay = 'oneWay' in solid && solid.oneWay;
    if (oneWay) {
      const wasAbove = previous.y + previous.height <= solid.y;
      const isFalling = next.velocityY >= 0;
      if (!wasAbove || !isFalling) continue;
    }

    if (!aabbIntersects(next, solid)) continue;

    const previousBottom = previous.y + previous.height;
    const nextBottom = next.y + next.height;
    const landingFromAbove =
      previousBottom <= solid.y && nextBottom >= solid.y && next.velocityY >= 0;
    if (landingFromAbove) {
      next = { ...next, y: solid.y - next.height, velocityY: 0 };
      grounded = true;
      standingOnId = solid.id;
      continue;
    }

    if (!oneWay) {
      const fromLeft = previous.x + previous.width <= solid.x;
      const fromRight = previous.x >= solid.x + solid.width;
      if (fromLeft) next = { ...next, x: solid.x - next.width, velocityX: 0 };
      else if (fromRight) next = { ...next, x: solid.x + solid.width, velocityX: 0 };
    }
  }

  return { body: next, grounded, standingOnId, touchedHazards };
}

export function canJumpOnObstacle(body: AABB, obstacle: StageObstacle): boolean {
  return (
    obstacle.jumpable && body.y + body.height <= obstacle.y + Math.max(12, obstacle.height * 0.25)
  );
}

export function nearestItemSpawn(stage: StageDefinition, position: Vector2): Vector2 {
  return stage.itemSpawnPoints.reduce(
    (best, point) => {
      const bestD = (best.x - position.x) ** 2 + (best.y - position.y) ** 2;
      const d = (point.x - position.x) ** 2 + (point.y - position.y) ** 2;
      return d < bestD ? point : best;
    },
    stage.itemSpawnPoints[0] ?? { x: stage.bounds.width / 2, y: stage.bounds.height - 64 }
  );
}
