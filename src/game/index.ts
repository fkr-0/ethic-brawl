/**
 * Game module exports
 */

// Fight module
export {
  type FighterStateName,
  type Direction,
  type AttackType,
  type AttackData,
  type FighterStats,
  STATE_TRANSITIONS,
  DEFAULT_ATTACK_CHAIN,
  FRAME_DATA,
} from './fight/fighter-state';

export {
  type HitResultType,
  type HitResult,
  type FighterCombatState,
  calculateDamage,
  isPerfectBlock,
  resolveHit,
  applyHitResult,
  canAct,
  canBlock,
  canAttack,
  canJump,
  canMove,
} from './fight/combat';

export {
  type ComboState,
  type ComboHit,
  COMBO_MULTIPLIERS,
  createComboState,
  addComboHit,
  updateCombo,
  breakCombo,
  getComboMultiplier,
  getScaledDamage,
  getComboDisplayText,
  getComboTierName,
} from './fight/combo';

export {
  type HitboxType,
  type HitboxConfig,
  type ActiveHitbox,
  createHitbox,
  DEFAULT_HURTBOX,
  ATTACK_HITBOXES,
  checkHit,
  getHitboxCenter,
  expandHitbox,
  createActiveHitbox,
} from './fight/hitbox';

export {
  Fighter,
  type CharacterDefinition,
} from './fight/fighter';

export {
  type PlayerInput,
  type FightResult,
  type RoundState,
  type FightState,
  createFightController,
  getLaneGroundY,
} from './fight/fight-controller';

// Physics module
export {
  calculateWalkVelocity,
  calculateRunVelocity,
  applyAcceleration,
  applyDeceleration,
  calculateJumpVelocity,
  applyGravity,
  applyAirControl,
  calculateKnockback,
  applyKnockbackDecay,
} from './physics/movement';

export {
  type CollisionLayer,
  type CollisionInfo,
  checkCollision,
  getCollisionInfo,
  resolveCollision,
  pointInRect,
  pointInCircle,
  lineIntersects,
} from './physics/collision';

export {
  type Lane,
  LANE_POSITIONS,
  getLaneY,
  isValidLane,
  getAdjacentLanes,
  calculateLaneTransition,
  getLaneFromY,
  areLanesAdjacent,
  getLaneDepthFactor,
  getLaneRenderOrder,
} from './physics/lanes';
