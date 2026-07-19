import { resolveAttackChoreography } from '@/game/fight/attack-presentation-presets';
import type { Fighter } from '@/game/fight/fighter';
import type { AttackData } from '@/game/fight/fighter-state';
import { FRAME_DATA } from '@/game/fight/fighter-state';
import { getLaneDepthFactor } from '@/game/physics/lanes';
import { clamp, easeInOutQuad, easeOutQuad, lerp } from '@/utils/math';

export type AttackAnimationPhase = 'startup' | 'active' | 'recovery' | null;

export interface FighterAnimationView {
  depthScale: number;
  bobOffsetY: number;
  bodyLean: number;
  bodyTwist: number;
  bodyWidthScale: number;
  bodyHeightScale: number;
  headOffsetX: number;
  headOffsetY: number;
  headScaleX: number;
  headScaleY: number;
  frontArmAngle: number;
  rearArmAngle: number;
  frontForeArmAngle: number;
  rearForeArmAngle: number;
  frontArmReach: number;
  rearArmReach: number;
  frontLegAngle: number;
  rearLegAngle: number;
  frontShinAngle: number;
  rearShinAngle: number;
  legSwing: number;
  guardArc: number;
  afterImageAlpha: number;
  flashColor: string | null;
  flashIntensity: number;
  attackPhase: AttackAnimationPhase;
  shadowScaleX: number;
  shadowScaleY: number;
  auraAlpha: number;
  landingImpact: number;
  turnaroundAmount: number;
  recoilOffsetX: number;
  actionOffsetX: number;
  actionOffsetY: number;
  motionBlur: number;
  impactPulse: number;
}

function getAttackPhase(
  currentAttack: AttackData | null,
  attackFrame: number
): AttackAnimationPhase {
  if (!currentAttack) {
    return null;
  }

  if (attackFrame < currentAttack.startup) {
    return 'startup';
  }
  if (attackFrame < currentAttack.startup + currentAttack.active) {
    return 'active';
  }

  return 'recovery';
}

function getPhaseProgress(currentAttack: AttackData | null, attackFrame: number): number {
  if (!currentAttack) {
    return 0;
  }

  if (attackFrame < currentAttack.startup) {
    return clamp(attackFrame / Math.max(1, currentAttack.startup - 1), 0, 1);
  }

  if (attackFrame < currentAttack.startup + currentAttack.active) {
    return clamp(
      (attackFrame - currentAttack.startup) / Math.max(1, currentAttack.active - 1),
      0,
      1
    );
  }

  return clamp(
    (attackFrame - currentAttack.startup - currentAttack.active) /
      Math.max(1, currentAttack.recovery - 1),
    0,
    1
  );
}

function getLocomotionCycle(fighter: Fighter, globalFrame: number): number {
  const velocity = Math.abs(fighter.moveVelocityX) + Math.abs(fighter.velocityX) * 0.35;
  const profile = fighter.character.animation;
  const frequency =
    (fighter.state === 'running' ? 0.34 : fighter.state === 'walking' ? 0.22 : 0.12) *
    profile.legStride;
  return globalFrame * frequency + velocity * 0.35 + fighter.playerId * 0.6 + profile.visualSeed;
}

export function createFighterAnimationView(
  fighter: Fighter,
  globalFrame: number
): FighterAnimationView {
  const depthScale = getLaneDepthFactor(fighter.lane);
  const signedVelocity = fighter.moveVelocityX + fighter.velocityX;
  const speed = Math.abs(signedVelocity);
  const motionVariation = fighter.attackMotionVariation;
  const locomotionCycle =
    getLocomotionCycle(fighter, globalFrame) + motionVariation.cadenceJitter * 12;
  const locomotionPulse = Math.sin(locomotionCycle);
  const locomotionCounterPulse = Math.sin(locomotionCycle + Math.PI / 2);
  const locomotionBounce = Math.abs(Math.cos(locomotionCycle));
  const moveDirection = signedVelocity === 0 ? 0 : signedVelocity > 0 ? 1 : -1;
  const facingDirection = fighter.facing === 'right' ? 1 : -1;
  const movementIntent = moveDirection * facingDirection;
  const attackPhase = getAttackPhase(fighter.currentAttack, fighter.attackFrame);
  const basePhaseProgress = getPhaseProgress(fighter.currentAttack, fighter.attackFrame);
  const profile = fighter.character.animation;
  const idlePulse = Math.sin(globalFrame * 0.08 + profile.visualSeed * 2.3);
  const idleBreathPulse = Math.sin(globalFrame * 0.06 + profile.visualSeed * 1.3);

  let bobOffsetY = fighter.isGrounded ? locomotionBounce * Math.min(5, speed * 0.55) : 0;
  let bodyLean = clamp(movementIntent * speed * 0.025, -0.22, 0.22);
  let bodyTwist = clamp(movementIntent * speed * 0.018, -0.15, 0.15);
  let bodyWidthScale = 1;
  let bodyHeightScale = 1;
  let headOffsetX = movementIntent * speed * 0.3;
  let headOffsetY = -6 - locomotionBounce * Math.min(speed, 6) * 0.5;
  let headScaleX = 1;
  let headScaleY = 1;
  let frontArmAngle = 0.45 + locomotionPulse * 0.35;
  let rearArmAngle = -0.35 - locomotionPulse * 0.3;
  let frontForeArmAngle = frontArmAngle + 0.28 + locomotionCounterPulse * 0.14;
  let rearForeArmAngle = rearArmAngle - 0.22 - locomotionCounterPulse * 0.1;
  let frontArmReach = 0.55;
  let rearArmReach = 0.48;
  let frontLegAngle = locomotionPulse * 0.75;
  let rearLegAngle = -locomotionPulse * 0.75;
  let frontShinAngle = frontLegAngle + 0.48 + locomotionCounterPulse * 0.18;
  let rearShinAngle = rearLegAngle + 0.42 - locomotionCounterPulse * 0.12;
  let legSwing = 0;
  let guardArc = 0;
  let afterImageAlpha = 0;
  let flashColor: string | null = null;
  let flashIntensity = 0;
  let auraAlpha = 0;
  let actionOffsetX = 0;
  let actionOffsetY = 0;
  let motionBlur = 0;
  let impactPulse = 0;

  if (fighter.state === 'idle') {
    bobOffsetY += Math.abs(idleBreathPulse) * 1.4 * profile.idleBreath;
    bodyLean += idlePulse * 0.045 * profile.idleSway;
    bodyTwist += idlePulse * 0.03 * profile.idleSway;
    headOffsetX += idlePulse * 2.4 * profile.idleSway;
    headOffsetY -= Math.abs(idleBreathPulse) * 1.8 * profile.idleBreath;
    frontArmAngle += idlePulse * 0.08;
    rearArmAngle -= idlePulse * 0.08;
    frontForeArmAngle += idlePulse * 0.04;
    rearForeArmAngle -= idlePulse * 0.04;
  }

  if (fighter.state === 'walking' || fighter.state === 'running') {
    const swingBase = fighter.state === 'running' ? 0.95 : 0.55;
    legSwing = swingBase * clamp(speed / 5.5, 0.35, 1.25);
    frontLegAngle *= legSwing;
    rearLegAngle *= legSwing;
    frontShinAngle = frontLegAngle + 0.52 + locomotionCounterPulse * 0.28 * legSwing;
    rearShinAngle = rearLegAngle + 0.48 - locomotionCounterPulse * 0.24 * legSwing;
    frontArmAngle += -locomotionPulse * legSwing * 0.35;
    rearArmAngle += locomotionPulse * legSwing * 0.35;
    frontForeArmAngle = frontArmAngle + 0.34 + locomotionCounterPulse * 0.18;
    rearForeArmAngle = rearArmAngle - 0.28 - locomotionCounterPulse * 0.16;
    headOffsetY -= locomotionBounce * legSwing * 3.5;
    bodyLean += (fighter.state === 'running' ? 0.08 : 0.03) * movementIntent * profile.idleSway;
    if (fighter.state === 'running' && speed > 4.8) {
      afterImageAlpha = 0.16 + Math.min(0.22, (speed - 4.8) * 0.04);
    }
  } else {
    frontLegAngle *= 0.15;
    rearLegAngle *= 0.15;
  }

  if (fighter.state === 'jumping') {
    bobOffsetY -= profile.airborneFloat * 2;
    bodyWidthScale = 0.92;
    bodyHeightScale = 1.08;
    headOffsetY -= 5;
    frontLegAngle = 0.65;
    rearLegAngle = -0.55;
    frontShinAngle = 1.2;
    rearShinAngle = -0.1;
    frontArmAngle = 0.2;
    rearArmAngle = -0.2;
    frontForeArmAngle = 0.72;
    rearForeArmAngle = -0.56;
  }

  if (fighter.state === 'falling') {
    bobOffsetY -= profile.airborneFloat;
    bodyWidthScale = 1.06;
    bodyHeightScale = 0.95;
    headOffsetY -= 1;
    frontLegAngle = 0.35;
    rearLegAngle = -0.25;
    frontShinAngle = 0.96;
    rearShinAngle = 0.38;
    frontArmAngle = 0.5;
    rearArmAngle = -0.48;
    frontForeArmAngle = 1.02;
    rearForeArmAngle = -0.92;
  }

  if (fighter.state === 'blocking' || fighter.isBlocking) {
    guardArc = 0.9;
    bodyLean = -0.16;
    bodyTwist = -0.08;
    bodyWidthScale = 1.06;
    bodyHeightScale = 0.96;
    headOffsetX = -4;
    headOffsetY = -4;
    frontArmAngle = -0.7;
    rearArmAngle = -0.3;
    frontForeArmAngle = -1.2;
    rearForeArmAngle = -0.82;
    frontArmReach = 0.38;
    rearArmReach = 0.4;
    flashColor = '#00F5FF';
    flashIntensity = fighter.blockstunFrames > 0 ? 0.45 : 0.2;
  }

  if (attackPhase === 'startup') {
    const windup = easeInOutQuad(clamp(basePhaseProgress + motionVariation.startupShift, 0, 1));
    actionOffsetX = lerp(-6, -2, windup);
    actionOffsetY = Math.sin(windup * Math.PI) * 1.5;
    bodyLean = lerp(-0.24, -0.04, windup);
    bodyTwist = lerp(-0.16, -0.03, windup);
    bodyWidthScale = lerp(1.08, 1.02, windup);
    bodyHeightScale = lerp(0.92, 0.98, windup);
    headOffsetX = lerp(-8, -1, windup);
    headOffsetY -= lerp(1, 4, windup);
    frontArmAngle = lerp(-0.75, -0.18, windup);
    rearArmAngle = lerp(-1.05, -0.62, windup);
    frontForeArmAngle = lerp(-1.05, 0.12, windup);
    rearForeArmAngle = lerp(-1.35, -0.88, windup);
    frontArmReach = lerp(0.32, 0.74, windup);
    rearArmReach = lerp(0.56, 0.76, windup);
    frontLegAngle = lerp(-0.36, -0.12, windup);
    rearLegAngle = lerp(0.52, 0.28, windup);
    frontShinAngle = lerp(0.12, 0.42, windup);
    rearShinAngle = lerp(0.84, 0.58, windup);
  } else if (attackPhase === 'active') {
    const strike = easeOutQuad(clamp(basePhaseProgress + motionVariation.activeShift, 0, 1));
    const strikePulse = Math.sin(strike * Math.PI);
    actionOffsetX = lerp(8, 15, strike) + strikePulse * 3;
    actionOffsetY = -strikePulse * 2.5;
    motionBlur = 0.32 + strikePulse * 0.46;
    impactPulse = strikePulse;
    bodyLean = lerp(0.16, 0.28, strike);
    bodyTwist = lerp(0.24, 0.06, strike);
    bodyWidthScale = lerp(0.98, 0.94, strike);
    bodyHeightScale = lerp(1.02, 1.06, strike);
    headOffsetX = lerp(5, 10, strike);
    headOffsetY -= lerp(2, 4, strike);
    frontArmAngle = lerp(-0.08, 0.32, strike);
    rearArmAngle = lerp(-0.56, -0.2, strike);
    frontForeArmAngle = lerp(0.44, 0.9, strike);
    rearForeArmAngle = lerp(-0.94, -0.48, strike);
    frontArmReach = lerp(0.96, 1.18, strike);
    rearArmReach = lerp(0.62, 0.48, strike);
    frontLegAngle = lerp(0.28, 0.5, strike);
    rearLegAngle = lerp(-0.18, -0.34, strike);
    frontShinAngle = lerp(0.76, 0.94, strike);
    rearShinAngle = lerp(0.26, 0.08, strike);
    auraAlpha = fighter.state === 'special' ? 0.34 : 0.12;
  } else if (attackPhase === 'recovery') {
    const settle = easeOutQuad(clamp(basePhaseProgress + motionVariation.recoveryShift, 0, 1));
    const recoveryOvershoot = Math.sin(settle * Math.PI) * (1 - settle);
    actionOffsetX = lerp(10, 0, settle) - recoveryOvershoot * 4;
    actionOffsetY = recoveryOvershoot * 2;
    motionBlur = Math.max(0, (1 - settle) * 0.22);
    bodyLean = lerp(0.05, -0.1, settle);
    bodyTwist = lerp(0.08, -0.08, settle);
    bodyWidthScale = lerp(0.98, 1.04, settle);
    bodyHeightScale = lerp(1.02, 0.98, settle);
    headOffsetX = lerp(2, -4, settle);
    frontArmAngle = lerp(0.4, 0.52, settle);
    rearArmAngle = lerp(-0.34, -0.16, settle);
    frontForeArmAngle = lerp(0.78, 0.5, settle);
    rearForeArmAngle = lerp(-0.54, -0.28, settle);
    frontArmReach = lerp(0.86, 0.58, settle);
    rearArmReach = lerp(0.54, 0.46, settle);
    frontLegAngle = lerp(0.24, 0.08, settle);
    rearLegAngle = lerp(-0.2, 0.02, settle);
    frontShinAngle = lerp(0.72, 0.46, settle);
    rearShinAngle = lerp(0.18, 0.38, settle);
  }

  if (attackPhase && fighter.currentAttack) {
    const choreography = resolveAttackChoreography(fighter.currentAttack);
    const phaseProgress = clamp(basePhaseProgress, 0, 1);
    const phasePulse = Math.sin(phaseProgress * Math.PI);

    switch (choreography) {
      case 'straight':
        if (attackPhase === 'active') {
          actionOffsetX += 5 * phasePulse;
          motionBlur = Math.max(motionBlur, 0.48 + phasePulse * 0.24);
          frontArmReach += 0.22;
          frontForeArmAngle = lerp(0.2, 0.62, phaseProgress);
          bodyLean += 0.08 * phasePulse;
          headOffsetX += 4 * phasePulse;
        }
        break;
      case 'sweep':
        motionBlur = Math.max(motionBlur, 0.28 + phasePulse * 0.36);
        bodyTwist +=
          attackPhase === 'startup'
            ? lerp(-0.32, -0.12, phaseProgress)
            : attackPhase === 'active'
              ? lerp(0.44, 0.08, phaseProgress)
              : lerp(0.18, 0, phaseProgress);
        frontArmAngle -= 0.38 * phasePulse;
        rearArmAngle += 0.34 * phasePulse;
        frontArmReach += 0.12 * phasePulse;
        rearArmReach += 0.16 * phasePulse;
        break;
      case 'heel':
        if (attackPhase === 'startup') {
          bodyHeightScale -= 0.08 * phaseProgress;
          frontLegAngle = lerp(-0.12, 0.86, phaseProgress);
          frontShinAngle = lerp(0.42, 1.44, phaseProgress);
        } else if (attackPhase === 'active') {
          actionOffsetX += 3 * phasePulse;
          actionOffsetY -= 4 * phasePulse;
          impactPulse = Math.max(impactPulse, phasePulse * 0.9);
          bodyLean -= 0.14;
          bodyTwist += 0.14;
          frontLegAngle = lerp(1.3, 0.68, phaseProgress);
          frontShinAngle = lerp(0.32, 1.2, phaseProgress);
          headOffsetY -= 4 * phasePulse;
        }
        break;
      case 'orbit': {
        const orbit = fighter.attackFrame * 0.48;
        frontArmAngle = -0.5 + Math.sin(orbit) * 0.74;
        rearArmAngle = 0.42 + Math.sin(orbit + Math.PI) * 0.68;
        frontForeArmAngle = frontArmAngle + 0.72;
        rearForeArmAngle = rearArmAngle - 0.68;
        bodyTwist += Math.sin(orbit * 0.7) * 0.16;
        auraAlpha = Math.max(auraAlpha, 0.2 + phasePulse * 0.14);
        motionBlur = Math.max(motionBlur, 0.3 + phasePulse * 0.32);
        break;
      }
      case 'launcher':
        if (attackPhase === 'startup') {
          bodyHeightScale -= 0.18 * phaseProgress;
          bodyWidthScale += 0.12 * phaseProgress;
          bobOffsetY += 6 * phaseProgress;
          frontArmAngle = lerp(-0.86, -0.28, phaseProgress);
          frontForeArmAngle = lerp(-1.3, -0.62, phaseProgress);
        } else if (attackPhase === 'active') {
          actionOffsetX += 3 * phasePulse;
          actionOffsetY -= 8 * phasePulse;
          impactPulse = Math.max(impactPulse, phasePulse);
          bodyHeightScale += 0.14 * phasePulse;
          bobOffsetY -= 7 * phasePulse;
          frontArmAngle = lerp(-0.12, -1.42, phaseProgress);
          frontForeArmAngle = lerp(0.22, -1.7, phaseProgress);
          frontArmReach += 0.24;
          headOffsetY -= 5 * phasePulse;
        }
        break;
      case 'flurry': {
        const alternation = Math.sin(fighter.attackFrame * Math.PI * 0.72);
        frontArmAngle += alternation * 0.58;
        rearArmAngle -= alternation * 0.52;
        frontForeArmAngle += alternation * 0.72;
        rearForeArmAngle -= alternation * 0.68;
        bodyTwist += alternation * 0.15;
        afterImageAlpha = Math.max(afterImageAlpha, 0.18 + phasePulse * 0.16);
        motionBlur = Math.max(motionBlur, 0.52 + phasePulse * 0.34);
        break;
      }
      case 'invocation':
        frontArmAngle = lerp(-0.8, -1.38, phaseProgress);
        rearArmAngle = lerp(0.72, 1.34, phaseProgress);
        frontForeArmAngle = frontArmAngle - 0.42;
        rearForeArmAngle = rearArmAngle + 0.4;
        bodyHeightScale += 0.1 * phasePulse;
        bobOffsetY -= 6 * phasePulse;
        headOffsetY -= 4 * phasePulse;
        auraAlpha = Math.max(auraAlpha, 0.42 + phasePulse * 0.2);
        afterImageAlpha = Math.max(afterImageAlpha, 0.2);
        actionOffsetY -= 7 * phasePulse;
        motionBlur = Math.max(motionBlur, 0.3 + phasePulse * 0.22);
        break;
      case 'riposte':
        if (attackPhase === 'startup') {
          bodyLean = lerp(-0.34, -0.18, phaseProgress);
          headOffsetX -= 5;
          frontArmReach = 0.38;
        } else if (attackPhase === 'active') {
          actionOffsetX += 7 * phasePulse;
          bodyLean += 0.22;
          frontArmReach += 0.3;
          frontArmAngle = -0.08;
          frontForeArmAngle = 0.22;
          rearArmAngle = -0.84;
          afterImageAlpha = Math.max(afterImageAlpha, 0.22);
          motionBlur = Math.max(motionBlur, 0.46);
        }
        break;
    }
  }

  if (fighter.state === 'knockdown') {
    bobOffsetY = 0;
    bodyLean = 0.92;
    bodyTwist = 0.08;
    bodyWidthScale = 1.28;
    bodyHeightScale = 0.54;
    headOffsetX = -10;
    headOffsetY = 12;
    headScaleX = 1.08;
    headScaleY = 0.86;
    frontArmAngle = 1.45;
    rearArmAngle = 2.55;
    frontForeArmAngle = 1.88;
    rearForeArmAngle = 2.98;
    frontArmReach = 0.68;
    rearArmReach = 0.62;
    frontLegAngle = 1.05;
    rearLegAngle = 2.18;
    frontShinAngle = 1.38;
    rearShinAngle = 2.52;
    legSwing = 0;
    afterImageAlpha = 0;
  }

  if (fighter.state === 'gettingUp') {
    const getUpProgress = clamp(
      fighter.stateFrame / Math.max(1, FRAME_DATA.GET_UP_DURATION - 1),
      0,
      1
    );
    bobOffsetY += (1 - getUpProgress) * 3;
    bodyLean = lerp(0.72, 0.04, getUpProgress);
    bodyTwist = lerp(-0.18, 0, getUpProgress);
    bodyWidthScale = lerp(1.22, 1.02, getUpProgress);
    bodyHeightScale = lerp(0.62, 1.02, getUpProgress);
    headOffsetX = lerp(-12, -1, getUpProgress);
    headOffsetY = lerp(10, -6, getUpProgress);
    frontArmAngle = lerp(1.24, 0.18, getUpProgress);
    rearArmAngle = lerp(0.88, -0.2, getUpProgress);
    frontForeArmAngle = lerp(1.7, 0.44, getUpProgress);
    rearForeArmAngle = lerp(1.2, -0.36, getUpProgress);
    frontArmReach = lerp(0.76, 0.56, getUpProgress);
    rearArmReach = lerp(0.74, 0.48, getUpProgress);
    frontLegAngle = lerp(0.88, 0.16, getUpProgress);
    rearLegAngle = lerp(0.4, -0.08, getUpProgress);
    frontShinAngle = lerp(1.18, 0.56, getUpProgress);
    rearShinAngle = lerp(0.92, 0.34, getUpProgress);
  }

  if (fighter.state === 'special') {
    auraAlpha = Math.max(auraAlpha, 0.32 + Math.sin(globalFrame * 0.24) * 0.06);
    flashColor = flashColor ?? '#39FF14';
    flashIntensity = Math.max(flashIntensity, 0.24);
    afterImageAlpha = Math.max(afterImageAlpha, 0.12);
  }

  if (fighter.state === 'hitstun' || fighter.hitstunFrames > 0) {
    const hitReaction = clamp(fighter.hitstunFrames / 12, 0, 1);
    const hitJitter = Math.sin(globalFrame * 1.73 + profile.visualSeed * 3.1);
    actionOffsetX += hitJitter * 2.4 * hitReaction;
    actionOffsetY -=
      Math.abs(Math.cos(globalFrame * 1.21 + profile.visualSeed)) * 1.6 * hitReaction;
    impactPulse = Math.max(impactPulse, hitReaction);
    bodyLean = clamp((fighter.velocityX || -2) * 0.08, -0.35, 0.35);
    bodyTwist = bodyLean * 0.8;
    bodyWidthScale = 1.1;
    bodyHeightScale = 0.9;
    headOffsetX = bodyLean * 18;
    headOffsetY = 8;
    headScaleX = 1.04;
    headScaleY = 0.92;
    frontArmAngle = 1.05;
    rearArmAngle = -1.05;
    frontForeArmAngle = 1.52;
    rearForeArmAngle = -1.45;
    frontArmReach = 0.45;
    rearArmReach = 0.42;
    frontLegAngle = 0.55;
    rearLegAngle = -0.5;
    frontShinAngle = 1.18;
    rearShinAngle = -0.06;
    legSwing = 0.2;
    guardArc = 0;
    flashColor = '#FF073A';
    flashIntensity = 0.5 + Math.min(0.3, fighter.hitstunFrames * 0.02);
  }

  const landingImpact = easeOutQuad(
    clamp(fighter.landingFrames / FRAME_DATA.LANDING_IMPACT_DURATION, 0, 1)
  );
  if (landingImpact > 0) {
    actionOffsetY += landingImpact * 2.2;
    impactPulse = Math.max(impactPulse, landingImpact * 0.72);
    bobOffsetY += landingImpact * 4.5 * profile.recoverySpring;
    bodyHeightScale -= landingImpact * 0.16 * profile.recoverySpring;
    bodyWidthScale += landingImpact * 0.12 * profile.recoverySpring;
    headOffsetY += landingImpact * 4;
    frontLegAngle = lerp(frontLegAngle, 0.18, landingImpact);
    rearLegAngle = lerp(rearLegAngle, -0.12, landingImpact);
    frontShinAngle = lerp(frontShinAngle, 0.96, landingImpact);
    rearShinAngle = lerp(rearShinAngle, 0.88, landingImpact);
  }

  const turnaroundAmount = easeOutQuad(
    clamp(fighter.turnaroundFrames / FRAME_DATA.TURNAROUND_DURATION, 0, 1)
  );
  if (turnaroundAmount > 0) {
    const turnaroundDirection = fighter.facing === 'right' ? 1 : -1;
    bodyTwist += turnaroundDirection * 0.26 * turnaroundAmount * profile.turnaroundEmphasis;
    bodyLean -= turnaroundDirection * 0.12 * turnaroundAmount * profile.turnaroundEmphasis;
    bodyWidthScale -= turnaroundAmount * 0.12;
    headOffsetX -= turnaroundDirection * 6 * turnaroundAmount;
    frontArmAngle = lerp(frontArmAngle, -0.3 * turnaroundDirection, turnaroundAmount * 0.55);
    rearArmAngle = lerp(rearArmAngle, 0.25 * turnaroundDirection, turnaroundAmount * 0.45);
  }

  const recoilAmount = easeOutQuad(clamp(fighter.recoilFrames / FRAME_DATA.RECOIL_DURATION, 0, 1));
  const recoilOffsetX = fighter.recoilDirection * 9 * recoilAmount * profile.recoilEmphasis;
  if (recoilAmount > 0) {
    bodyLean -= fighter.recoilDirection * 0.18 * recoilAmount * profile.recoilEmphasis;
    bodyTwist -= fighter.recoilDirection * 0.12 * recoilAmount * profile.recoilEmphasis;
    headOffsetX += recoilOffsetX * 0.45;
    headOffsetY += recoilAmount * 2;
    afterImageAlpha = Math.max(afterImageAlpha, recoilAmount * 0.14);
    motionBlur = Math.max(motionBlur, recoilAmount * 0.26);
    impactPulse = Math.max(impactPulse, recoilAmount * 0.65);
  }

  if (attackPhase) {
    frontArmReach += motionVariation.reachJitter;
    rearArmReach += motionVariation.reachJitter * 0.72;
    bodyLean += motionVariation.leanJitter;
    bodyTwist += motionVariation.twistJitter;
    headOffsetX += motionVariation.twistJitter * 6;
  }

  bodyWidthScale *= profile.silhouetteWidth;
  bodyHeightScale *= profile.silhouetteHeight;
  headScaleX *= profile.headScaleX;
  headScaleY *= profile.headScaleY;
  frontArmReach *= profile.armReach;
  rearArmReach *= 0.92 + profile.armReach * 0.08;
  frontLegAngle *= profile.legStride;
  rearLegAngle *= profile.legStride;
  frontShinAngle *= 0.94 + profile.legStride * 0.06;
  rearShinAngle *= 0.94 + profile.legStride * 0.06;
  bodyLean *= 0.94 + profile.idleSway * 0.06;
  bobOffsetY += Math.abs(idleBreathPulse) * 0.6 * profile.idleBreath;

  return {
    depthScale,
    bobOffsetY,
    bodyLean,
    bodyTwist,
    bodyWidthScale,
    bodyHeightScale,
    headOffsetX,
    headOffsetY,
    headScaleX,
    headScaleY,
    frontArmAngle,
    rearArmAngle,
    frontForeArmAngle,
    rearForeArmAngle,
    frontArmReach,
    rearArmReach,
    frontLegAngle,
    rearLegAngle,
    frontShinAngle,
    rearShinAngle,
    legSwing,
    guardArc,
    afterImageAlpha,
    flashColor,
    flashIntensity,
    attackPhase,
    shadowScaleX:
      depthScale *
      (fighter.state === 'knockdown'
        ? 1.3
        : fighter.state === 'gettingUp'
          ? 1.1
          : fighter.isGrounded
            ? 1 + landingImpact * 0.12
            : 0.78),
    shadowScaleY:
      depthScale *
      (fighter.state === 'knockdown'
        ? 1.08
        : fighter.state === 'gettingUp'
          ? 0.96
          : fighter.isGrounded
            ? 1 - landingImpact * 0.18
            : 0.82),
    auraAlpha,
    landingImpact,
    turnaroundAmount,
    recoilOffsetX,
    actionOffsetX,
    actionOffsetY,
    motionBlur,
    impactPulse,
  };
}
