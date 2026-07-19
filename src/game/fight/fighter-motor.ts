import type { CharacterMovementProfile } from '@/content/characters/character-data';
import {
  applyAirControl,
  applyGravity,
  applyKnockbackDecay,
  calculateJumpVelocity,
  calculateMovementTuning,
  stepGroundedVelocity,
} from '@/game/physics/movement';
import { clamp } from '@/utils/math';
import type { Fighter } from './fighter';
import { FRAME_DATA, type Lane } from './fighter-state';

const MOVE_STATE_EPSILON = 0.05;
const MIN_X = 50;
const MAX_X = 910;

export interface FighterMotorInput {
  horizontalDirection: number;
  horizontalPressed: boolean;
  verticalDirection: number;
  verticalPressed: boolean;
  jumpPressed: boolean;
  currentFrame: number;
}

function canMotorSetGroundedState(fighter: Fighter): boolean {
  return (
    fighter.state === 'idle' ||
    fighter.state === 'walking' ||
    fighter.state === 'running' ||
    fighter.state === 'falling'
  );
}

function syncGroundedMovementState(fighter: Fighter): void {
  if (!fighter.isGrounded || !canMotorSetGroundedState(fighter)) {
    return;
  }

  const speed = Math.abs(fighter.moveVelocityX);
  if (speed <= MOVE_STATE_EPSILON) {
    fighter.isRunning = false;
    if (fighter.state !== 'idle') {
      fighter.setState('idle');
    }
    return;
  }

  const nextState = fighter.isRunning ? 'running' : 'walking';
  if (fighter.state !== nextState) {
    fighter.setState(nextState);
  }
}

function updateRunIntent(fighter: Fighter, input: FighterMotorInput): void {
  if (input.horizontalDirection === 0 || !input.horizontalPressed) {
    if (input.horizontalDirection === 0) {
      fighter.isRunning = false;
    }
    return;
  }

  const currentDirection = input.horizontalDirection < 0 ? 'left' : 'right';
  const framesSinceLastTap = input.currentFrame - fighter.runTapTime;
  fighter.isRunning =
    fighter.lastDirection === currentDirection &&
    framesSinceLastTap <= FRAME_DATA.RUN_DOUBLE_TAP_WINDOW;
  fighter.lastDirection = currentDirection;
  fighter.runTapTime = input.currentFrame;
}

function getWalkSpeed(fighter: Fighter, movement: CharacterMovementProfile): number {
  return calculateMovementTuning(fighter.stats.agility, movement).walkSpeed;
}

export function updateFighterMotorFromInput(fighter: Fighter, input: FighterMotorInput): void {
  const tuning = calculateMovementTuning(fighter.stats.agility, fighter.movement);

  if (
    fighter.state === 'knockdown' ||
    fighter.state === 'gettingUp' ||
    fighter.state === 'defeat' ||
    fighter.state === 'victory'
  ) {
    fighter.isRunning = false;
    fighter.moveVelocityX = stepGroundedVelocity(
      fighter.moveVelocityX,
      0,
      tuning.acceleration,
      tuning.deceleration
    );
    return;
  }

  if (fighter.hitstunFrames > 0 || fighter.blockstunFrames > 0) {
    fighter.isRunning = false;
    if (fighter.isGrounded) {
      fighter.moveVelocityX = stepGroundedVelocity(
        fighter.moveVelocityX,
        0,
        tuning.acceleration,
        tuning.deceleration
      );
      syncGroundedMovementState(fighter);
    }
    return;
  }

  updateRunIntent(fighter, input);

  if (fighter.isGrounded) {
    const targetVelocity =
      input.horizontalDirection === 0
        ? 0
        : (fighter.isRunning ? tuning.runSpeed : tuning.walkSpeed) * input.horizontalDirection;

    fighter.moveVelocityX = stepGroundedVelocity(
      fighter.moveVelocityX,
      targetVelocity,
      tuning.acceleration,
      tuning.deceleration
    );
    syncGroundedMovementState(fighter);
  } else if (input.horizontalDirection !== 0) {
    fighter.velocityX = applyAirControl(
      fighter.velocityX,
      input.horizontalDirection,
      getWalkSpeed(fighter, fighter.movement),
      tuning.airControl
    );
  }

  if (fighter.laneChangeTimer === 0 && input.verticalPressed) {
    if (input.verticalDirection > 0 && fighter.lane < 2) {
      fighter.laneChangeStartLane = fighter.lane;
      fighter.targetLane = Math.min(2, fighter.lane + 1) as Lane;
      fighter.laneChangeTimer = FRAME_DATA.LANE_CHANGE_DURATION;
    } else if (input.verticalDirection < 0 && fighter.lane > 0) {
      fighter.laneChangeStartLane = fighter.lane;
      fighter.targetLane = Math.max(0, fighter.lane - 1) as Lane;
      fighter.laneChangeTimer = FRAME_DATA.LANE_CHANGE_DURATION;
    }
  }

  if (input.jumpPressed && fighter.isGrounded && fighter.state !== 'jumping') {
    fighter.velocityY = calculateJumpVelocity(
      fighter.stats.agility,
      fighter.movement.jumpMultiplier
    );
    fighter.velocityX += fighter.moveVelocityX;
    fighter.moveVelocityX = 0;
    fighter.isGrounded = false;
    fighter.isRunning = false;
    fighter.setState('jumping');
  }
}

export function applyFighterMotor(fighter: Fighter): void {
  if (fighter.laneChangeTimer > 0) {
    fighter.laneChangeTimer--;
    if (fighter.laneChangeTimer === 0) {
      fighter.lane = fighter.targetLane;
      fighter.laneChangeStartLane = fighter.targetLane;
    }
  }

  const wasGrounded = fighter.isGrounded;
  const landingVelocity = fighter.velocityY;

  if (!fighter.isGrounded) {
    fighter.velocityY = applyGravity(fighter.velocityY);
    fighter.y += fighter.velocityY;

    if (fighter.velocityY <= 0 && fighter.state === 'jumping') {
      fighter.setState('falling');
    }

    if (fighter.y <= 0) {
      fighter.y = 0;
      fighter.velocityY = 0;
      fighter.isGrounded = true;
      if (!wasGrounded) {
        fighter.isRunning = false;
        fighter.triggerLanding(Math.abs(landingVelocity) / 5);
      }
      syncGroundedMovementState(fighter);
    }
  }

  fighter.x += fighter.moveVelocityX + fighter.velocityX;

  fighter.velocityX =
    Math.abs(fighter.velocityX) <= MOVE_STATE_EPSILON
      ? 0
      : applyKnockbackDecay(fighter.velocityX, fighter.externalVelocityDecay);

  fighter.x = clamp(fighter.x, MIN_X, MAX_X);

  if (fighter.isGrounded) {
    syncGroundedMovementState(fighter);
  }
}
