/**
 * Movement physics utilities
 */

import type { CharacterMovementProfile } from '@/content/characters/character-data';
import { approach, clampNumber, integrateAcceleration } from '../../../vendor/arcade-runtime.mjs';
import { FRAME_DATA } from '../fight/fighter-state';

export interface MovementTuning {
  walkSpeed: number;
  runSpeed: number;
  acceleration: number;
  deceleration: number;
  jumpVelocity: number;
  airControl: number;
  weight: number;
}

/**
 * Calculate movement tuning from agility and profile data
 */
export function calculateMovementTuning(
  agility: number,
  profile: CharacterMovementProfile
): MovementTuning {
  const agilityWalkMultiplier = 1 + agility * 0.02;
  const agilityJumpMultiplier = 1 + agility * 0.01;

  return {
    walkSpeed: FRAME_DATA.WALK_SPEED * agilityWalkMultiplier * profile.walkMultiplier,
    runSpeed: FRAME_DATA.RUN_SPEED * agilityWalkMultiplier * profile.runMultiplier,
    acceleration: FRAME_DATA.RUN_ACCELERATION * profile.accelerationMultiplier,
    deceleration: FRAME_DATA.RUN_DECELERATION * profile.decelerationMultiplier,
    jumpVelocity: FRAME_DATA.JUMP_VELOCITY * agilityJumpMultiplier * profile.jumpMultiplier,
    airControl: FRAME_DATA.AIR_CONTROL * profile.airControlMultiplier,
    weight: profile.weight,
  };
}

/**
 * Calculate walk velocity
 */
export function calculateWalkVelocity(
  direction: number,
  agility: number,
  walkMultiplier = 1
): number {
  const baseSpeed = FRAME_DATA.WALK_SPEED;
  const agilityBonus = agility * 0.02; // 2% per agility point
  return direction * baseSpeed * (1 + agilityBonus) * walkMultiplier;
}

/**
 * Calculate run velocity
 */
export function calculateRunVelocity(
  direction: number,
  agility: number,
  runMultiplier = 1
): number {
  const baseSpeed = FRAME_DATA.RUN_SPEED;
  const agilityBonus = agility * 0.02;
  return direction * baseSpeed * (1 + agilityBonus) * runMultiplier;
}

/**
 * Apply acceleration to reach target velocity
 */
export function applyAcceleration(
  currentVelocity: number,
  targetVelocity: number,
  acceleration: number = FRAME_DATA.RUN_ACCELERATION
): number {
  return approach(currentVelocity, targetVelocity, acceleration);
}

/**
 * Apply deceleration (friction)
 */
export function applyDeceleration(
  currentVelocity: number,
  deceleration: number = FRAME_DATA.RUN_DECELERATION
): number {
  return approach(currentVelocity, 0, deceleration);
}

/**
 * Step grounded velocity toward a target speed using acceleration and deceleration
 */
export function stepGroundedVelocity(
  currentVelocity: number,
  targetVelocity: number,
  acceleration: number,
  deceleration: number
): number {
  if (targetVelocity === 0) {
    return applyDeceleration(currentVelocity, deceleration);
  }

  return applyAcceleration(currentVelocity, targetVelocity, acceleration);
}

/**
 * Calculate jump velocity
 */
export function calculateJumpVelocity(agility: number, jumpMultiplier = 1): number {
  const baseVelocity = FRAME_DATA.JUMP_VELOCITY;
  const agilityBonus = agility * 0.01; // 1% per agility point
  return baseVelocity * (1 + agilityBonus) * jumpMultiplier;
}

/**
 * Apply gravity to vertical velocity
 */
export function applyGravity(velocityY: number): number {
  return integrateAcceleration(velocityY, -FRAME_DATA.GRAVITY);
}

/**
 * Apply air control to horizontal velocity
 */
export function applyAirControl(
  currentVelocity: number,
  inputDirection: number,
  walkSpeed: number,
  airControl: number = FRAME_DATA.AIR_CONTROL
): number {
  const maxAirSpeed = Math.abs(walkSpeed);
  const airControlForce = maxAirSpeed * airControl;
  const nextVelocity = currentVelocity + inputDirection * airControlForce;
  return clampNumber(nextVelocity, -maxAirSpeed, maxAirSpeed);
}

/**
 * Calculate knockback with weight consideration
 */
export function calculateKnockback(baseKnockback: number, weight = 1): number {
  return baseKnockback / weight;
}

/**
 * Apply knockback decay
 */
export function applyKnockbackDecay(knockback: number, decay = 0.95): number {
  return knockback * decay;
}
