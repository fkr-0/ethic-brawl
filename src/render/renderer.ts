/**
 * Main canvas renderer
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';
import { CHARACTERS, type CharacterId } from '@/content/characters/character-data';
import { getComboDisplayText } from '@/game/fight/combo';
import { type FightState, getLaneGroundY } from '@/game/fight/fight-controller';
import type { Fighter } from '@/game/fight/fighter';
import type { Camera } from './camera';
import {
  type FightGraphicsProfile,
  type FightPresentationOptions,
  renderAttackTelegraph,
  renderCombatScreenFeedback,
  renderFightBackdrop,
  renderFightForeground,
  resolveFightGraphicsProfile,
} from './fight-presentation';
import { createFighterAnimationView } from './fighter-animation-view';
import {
  canRenderSprites,
  createAnimationPlayerState,
  getAtlasFrame,
  getAttackPhaseClip,
  getCharacterAnimationMap,
  getSpriteScaleFactor,
  getStateClip,
  playClip,
  renderFighterSprite,
  resolveAttackPhase,
  resolveAttackPhaseProgress,
  resolveFighterSpriteRenderScale,
  seekToProgress,
  updateAnimationPlayer,
} from './sprites';
import type { AnimationClip, AttackPhase, CharacterAnimationMap } from './sprites';
import { collectAmbientEffectsForFighter, renderAmbientEffect, renderVisualEffect } from './vfx';

/**
 * Global sprite rendering toggle
 */
export let SPRITE_RENDERING_ENABLED = true;

export function setSpriteRendering(enabled: boolean): void {
  SPRITE_RENDERING_ENABLED = enabled;
}

/**
 * Render conviction energy and global special cooldown beneath a health bar.
 */
export function renderSpecialMeter(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  x: number,
  y: number,
  width: number,
  color: string,
  isPlayer2 = false
): void {
  const energyPercent =
    fighter.specialState.maxEnergy > 0
      ? fighter.specialState.currentEnergy / fighter.specialState.maxEnergy
      : 0;
  const cooldownPercent =
    fighter.specialMaxCooldown > 0 ? 1 - fighter.specialCooldown / fighter.specialMaxCooldown : 1;
  const ready = fighter.specialCooldown <= 0;

  ctx.fillStyle = 'rgba(13, 5, 24, 0.88)';
  ctx.fillRect(x, y, width, 10);
  ctx.fillStyle = color;
  const energyWidth = width * Math.max(0, Math.min(1, energyPercent));
  ctx.fillRect(isPlayer2 ? x + width - energyWidth : x, y, energyWidth, 10);

  ctx.fillStyle = '#241533';
  ctx.fillRect(x, y + 13, width, 4);
  ctx.fillStyle = ready ? '#39FF14' : '#FF9F1C';
  const cooldownWidth = width * Math.max(0, Math.min(1, cooldownPercent));
  ctx.fillRect(isPlayer2 ? x + width - cooldownWidth : x, y + 13, cooldownWidth, 4);

  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillStyle = ready ? '#39FF14' : '#B8A9C9';
  ctx.textAlign = isPlayer2 ? 'right' : 'left';
  ctx.fillText(
    ready
      ? `SPECIAL READY · ${Math.round(fighter.specialState.currentEnergy)} CONVICTION`
      : `SPECIAL ${Math.ceil(fighter.specialCooldown / 60)}s · ${Math.round(fighter.specialState.currentEnergy)} CONVICTION`,
    isPlayer2 ? x + width : x,
    y + 28
  );
}

/**
 * Per-fighter animation player state cache
 */
const fighterAnimationStateCache = new Map<string, ReturnType<typeof createAnimationPlayerState>>();

/**
 * Track the last known state for each fighter to detect state changes
 */
const fighterLastStateCache = new Map<string, string>();

/**
 * Track the last known grounded state for each fighter
 */
const fighterGroundedCache = new Map<string, boolean>();

/**
 * Track fighters that have completed landing animation
 */
const fighterLandingCompleteCache = new Map<string, boolean>();

interface SpriteClipTransition {
  clip: AnimationClip;
  frame: number;
  ttl: number;
  totalTtl: number;
}

export interface FighterAnimationSnapshot {
  fighterId: string;
  state: string;
  clipId: string;
  clipFrame: number;
  clipFrameCount: number;
  atlasFrameIndex: number;
  nextAtlasFrameIndex: number;
  frameBlend: number;
  playbackSpeed: number;
  attackPhase: AttackPhase | null;
  attackPhaseProgress: number;
  transitionFromClipId: string | null;
  transitionAlpha: number;
  depthScale: number;
  stretchX: number;
  stretchY: number;
  afterImageAlpha: number;
}

const fighterClipTransitionCache = new Map<string, SpriteClipTransition>();
const fighterAnimationSnapshotCache = new Map<string, FighterAnimationSnapshot>();

export function getFighterAnimationSnapshot(fighterId: string): FighterAnimationSnapshot | null {
  return fighterAnimationSnapshotCache.get(fighterId) ?? null;
}

function smoothStep01(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function resolveNextClipFrame(
  clip: AnimationClip,
  currentFrame: number,
  direction: 1 | -1
): number {
  if (clip.frames.length <= 1) return currentFrame;
  if (clip.mode === 'loop') return (currentFrame + 1) % clip.frames.length;
  if (clip.mode === 'pingpong') {
    if (direction === 1) return Math.min(clip.frames.length - 1, currentFrame + 1);
    return Math.max(0, currentFrame - 1);
  }
  return Math.min(clip.frames.length - 1, currentFrame + 1);
}

function resolveSpriteFrameBlend(
  animationState: ReturnType<typeof createAnimationPlayerState>,
  combatProgress: number | null
): { nextFrame: number; blend: number } {
  const clip = animationState.currentClip;
  if (!clip || clip.frames.length <= 1) {
    return { nextFrame: animationState.currentFrame, blend: 0 };
  }

  if (combatProgress !== null) {
    const framePosition = Math.max(0, Math.min(1, combatProgress)) * (clip.frames.length - 1);
    const currentFrame = Math.min(clip.frames.length - 1, Math.floor(framePosition));
    const localProgress = framePosition - currentFrame;
    return {
      nextFrame: Math.min(clip.frames.length - 1, currentFrame + 1),
      blend: smoothStep01((localProgress - 0.62) / 0.38),
    };
  }

  const currentClipFrame = clip.frames[animationState.currentFrame];
  const localProgress = currentClipFrame
    ? animationState.frameTimer / Math.max(1, currentClipFrame.duration)
    : 0;
  return {
    nextFrame: resolveNextClipFrame(clip, animationState.currentFrame, animationState.direction),
    blend: smoothStep01((localProgress - 0.68) / 0.32),
  };
}

/**
 * Get or create animation player state for a fighter
 */
function getFighterAnimationState(
  fighterId: string
): ReturnType<typeof createAnimationPlayerState> {
  const cached = fighterAnimationStateCache.get(fighterId);
  if (cached) {
    return cached;
  }

  const created = createAnimationPlayerState();
  fighterAnimationStateCache.set(fighterId, created);
  return created;
}

/**
 * Clear animation state cache (call on reset)
 */
export function clearFighterAnimationCache(): void {
  fighterAnimationStateCache.clear();
  fighterLastStateCache.clear();
  fighterGroundedCache.clear();
  fighterLandingCompleteCache.clear();
  fighterClipTransitionCache.clear();
  fighterAnimationSnapshotCache.clear();
  // Clear all effective state caches
  for (const key of Array.from(fighterLastStateCache.keys())) {
    if (key.includes('_effective')) {
      fighterLastStateCache.delete(key);
    }
  }
}

/**
 * Render context
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  frame: number;
  deltaTime: number;
}

/**
 * Clear the canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Render background with parallax
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame = 0,
  profile: FightGraphicsProfile = resolveFightGraphicsProfile()
): void {
  renderFightBackdrop(ctx, camera, frame, profile);
}

/**
 * Render ground/arena
 */
export function renderArena(
  ctx: CanvasRenderingContext2D,
  _camera: Camera,
  profile: FightGraphicsProfile = resolveFightGraphicsProfile()
): void {
  // Ground
  ctx.fillStyle = profile.floorColor;
  ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

  const floorGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 100, 0, CANVAS_HEIGHT);
  floorGradient.addColorStop(0, `${profile.floorHighlight}88`);
  floorGradient.addColorStop(1, `${profile.floorColor}00`);
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

  // Lane lines
  ctx.strokeStyle = `${profile.floorHighlight}AA`;
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 10]);

  for (let lane = 0; lane < 3; lane++) {
    const y = getLaneGroundY(lane as 0 | 1 | 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  ctx.setLineDash([]);

  // Arena edges (glowing)
  const edgeGradientLeft = ctx.createLinearGradient(0, 0, 50, 0);
  edgeGradientLeft.addColorStop(0, `${profile.secondaryAccent}44`);
  edgeGradientLeft.addColorStop(1, 'transparent');
  ctx.fillStyle = edgeGradientLeft;
  ctx.fillRect(0, 0, 50, CANVAS_HEIGHT);

  const edgeGradientRight = ctx.createLinearGradient(CANVAS_WIDTH - 50, 0, CANVAS_WIDTH, 0);
  edgeGradientRight.addColorStop(0, 'transparent');
  edgeGradientRight.addColorStop(1, `${profile.accent}44`);
  ctx.fillStyle = edgeGradientRight;
  ctx.fillRect(CANVAS_WIDTH - 50, 0, 50, CANVAS_HEIGHT);
}

/**
 * Render a fighter with sprite or procedural fallback
 */
export function renderFighter(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  camera: Camera,
  frame = 0
): void {
  const animMap = getCharacterAnimationMap(fighter.characterId as CharacterId);

  const useSprites =
    SPRITE_RENDERING_ENABLED && animMap && canRenderSprites(animMap, fighter.characterId);

  if (useSprites) {
    renderFighterWithSprite(ctx, fighter, animMap, frame);
  } else {
    fighterAnimationSnapshotCache.delete(fighter.id);
    renderFighterProcedural(ctx, fighter, camera, frame);
  }
}

/**
 * Render fighter with sprite system
 */
function renderFighterWithSprite(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  animMap: CharacterAnimationMap,
  frame: number
): void {
  const animState = getFighterAnimationState(fighter.id);
  const previousState = fighterLastStateCache.get(fighter.id);
  let targetClip: ReturnType<typeof getStateClip> | ReturnType<typeof getAttackPhaseClip> | null =
    null;
  let attackPhase: AttackPhase | null = null;
  let attackPhaseProgress = 0;
  let usesCombatSyncedPlayback = false;

  if (fighter.state === 'attacking' || fighter.state === 'special') {
    if (fighter.currentAttack) {
      attackPhase = resolveAttackPhase(
        fighter.attackFrame,
        fighter.currentAttack.startup,
        fighter.currentAttack.active,
        fighter.currentAttack.recovery
      );
      attackPhaseProgress = resolveAttackPhaseProgress(
        fighter.attackFrame,
        fighter.currentAttack.startup,
        fighter.currentAttack.active,
        fighter.currentAttack.recovery
      );
      targetClip = getAttackPhaseClip(
        animMap,
        fighter.currentAttack.id,
        attackPhase,
        fighter.currentAttack.type
      );
      usesCombatSyncedPlayback = true;
    }
  }

  if (!targetClip) {
    targetClip = getStateClip(animMap, fighter.state);
  }

  // Override state for landing - if fighter is landing but state shows jumping/falling, use idle clip
  if (fighter.landingFrames > 0 && (fighter.state === 'jumping' || fighter.state === 'falling')) {
    targetClip = getStateClip(animMap, 'idle');
  }

  fighterGroundedCache.set(fighter.id, fighter.isGrounded);

  // Use landing state to override animation when actively landing
  const isCurrentlyLanding = fighter.landingFrames > 0;
  let landingComplete = fighterLandingCompleteCache.get(fighter.id) || false;

  // Mark landing as complete when landing frames end while grounded
  if (isCurrentlyLanding && fighter.isGrounded) {
    landingComplete = true;
    fighterLandingCompleteCache.set(fighter.id, true);
  }

  // Reset landing completion when jumping again
  if ((fighter.state === 'jumping' || fighter.state === 'falling') && !fighter.isGrounded) {
    landingComplete = false;
    fighterLandingCompleteCache.set(fighter.id, false);
  }

  // Determine effective state and clip
  let effectiveState = fighter.state;
  let effectiveClip = targetClip;

  // Only apply landing override if the fighter is actually coming from a jump/fall
  const wasJumpingOrFalling = previousState === 'jumping' || previousState === 'falling';

  // Reset landing completion when starting a new grounded action (running, walking, etc.)
  if (
    landingComplete &&
    fighter.isGrounded &&
    (fighter.state === 'running' ||
      fighter.state === 'walking' ||
      fighter.state === 'attacking' ||
      fighter.state === 'blocking')
  ) {
    landingComplete = false;
    fighterLandingCompleteCache.set(fighter.id, false);
  }

  // If landing is complete after jumping, force idle animation
  if (landingComplete && wasJumpingOrFalling && fighter.isGrounded) {
    effectiveClip = getStateClip(animMap, 'idle');
    effectiveState = 'idle';
  } else if (isCurrentlyLanding && wasJumpingOrFalling) {
    // While actively landing from a jump, use idle animation
    effectiveClip = getStateClip(animMap, 'idle');
  }
  // Don't override running animation - let it play normally

  // Check if effective state has changed
  const lastEffectiveState = fighterLastStateCache.get(`${fighter.id}_effective`);
  const effectiveStateChanged = lastEffectiveState !== effectiveState;
  fighterLastStateCache.set(`${fighter.id}_effective`, effectiveState);

  // Determine if we need to switch clips
  const needsClipChange =
    !animState.currentClip ||
    !effectiveClip ||
    animState.currentClip.id !== effectiveClip.id ||
    effectiveStateChanged;

  if (effectiveClip && needsClipChange) {
    const locomotionSpeed = Math.abs(fighter.moveVelocityX) + Math.abs(fighter.velocityX) * 0.35;
    const playbackSpeed =
      effectiveState === 'running'
        ? Math.max(0.8, Math.min(1.8, 0.72 + locomotionSpeed * 0.12))
        : effectiveState === 'walking'
          ? Math.max(0.72, Math.min(1.3, 0.7 + locomotionSpeed * 0.08))
          : 1;
    if (animState.currentClip && animState.currentClip.id !== effectiveClip.id) {
      fighterClipTransitionCache.set(fighter.id, {
        clip: animState.currentClip,
        frame: animState.currentFrame,
        ttl: 4,
        totalTtl: 4,
      });
    }
    const newState = playClip(animState, effectiveClip, playbackSpeed);
    Object.assign(animState, newState);
  }

  if (usesCombatSyncedPlayback) {
    Object.assign(animState, seekToProgress(animState, attackPhaseProgress));
    animState.isPlaying = true;
  } else {
    const updatedState = updateAnimationPlayer(animState, 1);
    Object.assign(animState, updatedState);
  }

  const frameBlendState = resolveSpriteFrameBlend(
    animState,
    usesCombatSyncedPlayback ? attackPhaseProgress : null
  );

  fighterLastStateCache.set(fighter.id, fighter.state);

  const screenX = fighter.x;
  const screenY = fighter.getWorldY();
  const facingRight = fighter.facing === 'right';
  const animation = createFighterAnimationView(fighter, frame);
  if (!animState.currentClip || !animMap.atlas) {
    console.warn(`Missing clip or atlas for ${fighter.characterId}, falling back to procedural`);
    renderFighterProcedural(
      ctx,
      fighter,
      { x: 0, y: 0, zoom: 1, shakeOffsetX: 0, shakeOffsetY: 0 } as Camera,
      frame
    );
    return;
  }

  const activeClipFrame = animState.currentClip.frames[animState.currentFrame];
  const activeAtlasFrame = activeClipFrame ? getAtlasFrame(animMap, activeClipFrame) : null;
  const depthScale = activeAtlasFrame
    ? resolveFighterSpriteRenderScale(animMap.atlas, animation.depthScale, getSpriteScaleFactor())
    : animation.depthScale;

  const stretchX = Math.max(0.86, Math.min(1.16, 1 + (animation.bodyWidthScale - 1) * 0.28));
  const stretchY = Math.max(0.86, Math.min(1.16, 1 + (animation.bodyHeightScale - 1) * 0.24));
  const rotation = Math.max(-0.12, Math.min(0.12, animation.bodyLean * 0.18));

  ctx.save();
  ctx.globalAlpha = fighter.state === 'knockdown' ? 0.28 : 0.22;
  ctx.fillStyle = '#05030A';
  ctx.translate(screenX, screenY + 3);
  ctx.scale(animation.shadowScaleX, animation.shadowScaleY);
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const drawSpritePose = (
    clip: AnimationClip,
    clipFrame: number,
    offsetX: number,
    opacity: number,
    blur = 0
  ): boolean => {
    ctx.save();
    ctx.translate(screenX + offsetX + animation.recoilOffsetX, screenY + animation.bobOffsetY);
    ctx.rotate(rotation);
    ctx.scale(stretchX, stretchY);
    if (blur > 0) {
      ctx.filter = `blur(${blur}px) saturate(1.35)`;
    } else if (animation.flashIntensity > 0) {
      ctx.filter = `brightness(${1 + animation.flashIntensity * 0.85}) saturate(${1 + animation.flashIntensity * 0.45})`;
    }
    const result = renderFighterSprite(
      ctx,
      animMap,
      clip,
      clipFrame,
      0,
      0,
      facingRight,
      depthScale,
      opacity,
      fighter.characterId
    );
    ctx.restore();
    return result;
  };

  const currentClip = animState.currentClip;
  const transition = fighterClipTransitionCache.get(fighter.id);
  const transitionAlpha = transition ? transition.ttl / transition.totalTtl : 0;
  if (transition && transitionAlpha > 0) {
    drawSpritePose(transition.clip, transition.frame, 0, transitionAlpha * 0.38, 0.45);
  }

  const velocity = fighter.moveVelocityX + fighter.velocityX;
  const trailDirection = velocity === 0 ? (facingRight ? -1 : 1) : velocity > 0 ? -1 : 1;
  if (animation.afterImageAlpha > 0.04) {
    drawSpritePose(
      currentClip,
      animState.currentFrame,
      trailDirection * 18,
      animation.afterImageAlpha * 0.42,
      1.4
    );
    drawSpritePose(
      currentClip,
      animState.currentFrame,
      trailDirection * 9,
      animation.afterImageAlpha * 0.68,
      0.7
    );
  }

  const rendered = drawSpritePose(currentClip, animState.currentFrame, 0, 1);
  if (frameBlendState.nextFrame !== animState.currentFrame && frameBlendState.blend > 0.01) {
    drawSpritePose(currentClip, frameBlendState.nextFrame, 0, frameBlendState.blend * 0.48);
  }

  const currentAtlasFrame = currentClip.frames[animState.currentFrame]?.frameIndex ?? -1;
  const nextAtlasFrame =
    currentClip.frames[frameBlendState.nextFrame]?.frameIndex ?? currentAtlasFrame;
  fighterAnimationSnapshotCache.set(fighter.id, {
    fighterId: fighter.id,
    state: effectiveState,
    clipId: currentClip.id,
    clipFrame: animState.currentFrame,
    clipFrameCount: currentClip.frames.length,
    atlasFrameIndex: currentAtlasFrame,
    nextAtlasFrameIndex: nextAtlasFrame,
    frameBlend: frameBlendState.blend,
    playbackSpeed: animState.playbackSpeed,
    attackPhase,
    attackPhaseProgress,
    transitionFromClipId: transition?.clip.id ?? null,
    transitionAlpha,
    depthScale,
    stretchX,
    stretchY,
    afterImageAlpha: animation.afterImageAlpha,
  });

  if (transition) {
    transition.ttl -= 1;
    if (transition.ttl <= 0) fighterClipTransitionCache.delete(fighter.id);
  }

  if (!rendered) {
    // Fall back to procedural rendering when sprites fail
    renderFighterProcedural(
      ctx,
      fighter,
      { x: 0, y: 0, zoom: 1, shakeOffsetX: 0, shakeOffsetY: 0 } as Camera,
      frame
    );
  }
}

/**
 * Render fighter with procedural animation (original implementation)
 */
function renderFighterProcedural(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  _camera: Camera,
  frame = 0
): void {
  const character = CHARACTERS[fighter.characterId as keyof typeof CHARACTERS];
  const colors = character?.colors ?? {
    primary: '#00F5FF',
    secondary: '#FF00FF',
    accent: '#39FF14',
  };

  const animation = createFighterAnimationView(fighter, frame);
  const screenX = fighter.x;
  const screenY = fighter.getWorldY() + animation.bobOffsetY;
  const bodyWidth = 42 * animation.bodyWidthScale;
  const bodyHeight = 62 * animation.bodyHeightScale;
  const bodyTop = -bodyHeight - 18;
  const headRadiusX = 18 * animation.headScaleX;
  const headRadiusY = 16 * animation.headScaleY;

  const drawSegmentedLimb = (
    upperAngle: number,
    lowerAngle: number,
    upperLength: number,
    lowerLength: number,
    lineWidth: number,
    strokeStyle: string
  ) => {
    const elbowX = Math.cos(upperAngle) * upperLength;
    const elbowY = Math.sin(upperAngle) * upperLength;
    const handX = elbowX + Math.cos(lowerAngle) * lowerLength;
    const handY = elbowY + Math.sin(lowerAngle) * lowerLength;

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    ctx.fillStyle = strokeStyle;
    ctx.beginPath();
    ctx.arc(elbowX, elbowY, Math.max(2, lineWidth * 0.45), 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBody = (ghostAlpha = 1, ghostOffsetX = 0) => {
    ctx.save();
    ctx.translate(ghostOffsetX + animation.recoilOffsetX, 0);
    ctx.globalAlpha *= ghostAlpha;

    if (animation.auraAlpha > 0) {
      ctx.save();
      ctx.globalAlpha *= animation.auraAlpha;
      ctx.fillStyle = colors.accent;
      ctx.shadowColor = colors.accent;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(0, bodyTop + bodyHeight * 0.55, 28, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(0, bodyTop + bodyHeight * 0.5);
    ctx.rotate(animation.bodyLean * 0.15);
    drawSegmentedLimb(
      animation.rearLegAngle,
      animation.rearShinAngle,
      15 + animation.legSwing * 4,
      13 + animation.legSwing * 4,
      6,
      colors.secondary
    );
    ctx.translate(0, -bodyHeight * 0.4);
    drawSegmentedLimb(
      animation.rearArmAngle,
      animation.rearForeArmAngle,
      14 + animation.rearArmReach * 8,
      12 + animation.rearArmReach * 8,
      6,
      colors.secondary
    );
    ctx.restore();

    ctx.save();
    ctx.translate(0, bodyTop + bodyHeight * 0.5);
    ctx.rotate(animation.bodyLean * 0.65);
    ctx.transform(1, 0, animation.bodyTwist * 0.35, 1, 0, 0);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(bodyWidth * 0.05, -bodyHeight * 0.35, 5, bodyHeight * 0.7);
    ctx.restore();

    ctx.save();
    ctx.translate(animation.headOffsetX, bodyTop + animation.headOffsetY);
    ctx.rotate(animation.bodyTwist * 0.15);
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.ellipse(0, 0, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-8, -4, 6, 4);
    ctx.fillRect(3, -4, 6, 4);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(-7, -2, 4, 2);
    ctx.fillRect(4, -2, 4, 2);
    ctx.restore();

    ctx.save();
    ctx.translate(0, bodyTop + bodyHeight * 0.5);
    ctx.rotate(animation.bodyLean * 0.12);
    drawSegmentedLimb(
      animation.frontLegAngle,
      animation.frontShinAngle,
      16 + animation.legSwing * 5,
      14 + animation.legSwing * 5,
      7,
      colors.primary
    );
    ctx.translate(0, -bodyHeight * 0.38);
    drawSegmentedLimb(
      animation.frontArmAngle,
      animation.frontForeArmAngle,
      15 + animation.frontArmReach * 9,
      13 + animation.frontArmReach * 10,
      7,
      colors.primary
    );
    ctx.restore();

    if (animation.guardArc > 0) {
      ctx.save();
      ctx.globalAlpha *= animation.guardArc;
      ctx.strokeStyle = `${colors.accent}CC`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(8, bodyTop + bodyHeight * 0.45, 34, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.restore();
    }

    if (animation.flashColor && animation.flashIntensity > 0) {
      ctx.save();
      ctx.globalAlpha *= animation.flashIntensity;
      ctx.fillStyle = animation.flashColor;
      ctx.beginPath();
      ctx.ellipse(0, bodyTop + bodyHeight * 0.42, 30, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  };

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.scale(animation.depthScale, animation.depthScale);

  if (fighter.facing === 'left') {
    ctx.scale(-1, 1);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26 * animation.shadowScaleX, 8 * animation.shadowScaleY, 0, 0, Math.PI * 2);
  ctx.fill();

  if (animation.afterImageAlpha > 0) {
    drawBody(animation.afterImageAlpha * 0.7, -(fighter.facing === 'right' ? 14 : -14));
    drawBody(animation.afterImageAlpha * 0.45, -(fighter.facing === 'right' ? 24 : -24));
  }

  if (animation.turnaroundAmount > 0.2) {
    drawBody(animation.turnaroundAmount * 0.12, fighter.facing === 'right' ? -10 : 10);
  }

  drawBody();
  ctx.restore();

  // Name label
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(character?.name ?? 'Fighter', screenX, screenY - 130 * animation.depthScale);
}

/**
 * Render health bar
 */
export function renderHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  currentHealth: number,
  maxHealth: number,
  color: string,
  label: string,
  isPlayer2 = false
): void {
  const percent = currentHealth / maxHealth;

  // Background
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(x, y, width, height);

  // Health fill
  const fillWidth = width * percent;
  if (isPlayer2) {
    ctx.fillStyle = color;
    ctx.fillRect(x + width - fillWidth, y, fillWidth, height);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, fillWidth, height);
  }

  // Low health warning
  if (percent < 0.25) {
    ctx.fillStyle = '#FF073A';
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
    if (isPlayer2) {
      ctx.fillRect(x + width - fillWidth, y, fillWidth, height);
    } else {
      ctx.fillRect(x, y, fillWidth, height);
    }
    ctx.globalAlpha = 1;
  }

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Label
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = isPlayer2 ? 'right' : 'left';
  ctx.fillText(label, isPlayer2 ? x + width : x, y - 5);

  // Health text
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(currentHealth)}`, x + width / 2, y + height - 5);
}

/**
 * Render combo display
 */
export function renderComboDisplay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
  color: string
): void {
  if (count < 2) return;

  const text = getComboDisplayText({ count, damage: 0, lastHitFrame: 0, isActive: true, hits: [] });
  const scale = 1 + Math.min(count * 0.05, 0.3);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, 0, 0);

  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillText(`${count} HIT`, 0, 40);

  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Render timer
 */
export function renderTimer(ctx: CanvasRenderingContext2D, time: number): void {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const text = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillStyle = time < 10 ? '#FF073A' : '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2, 45);

  // Flashing warning
  if (time < 10 && Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = '#FF073A44';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 60);
  }
}

/**
 * Render round indicator
 */
export function renderRoundIndicator(
  ctx: CanvasRenderingContext2D,
  p1Wins: number,
  p2Wins: number,
  roundsToWin: number
): void {
  const dotRadius = 8;
  const spacing = 25;
  const centerX = CANVAS_WIDTH / 2;
  const y = 75;

  // Player 1 dots (left side)
  for (let i = 0; i < roundsToWin; i++) {
    const x = centerX - 50 - i * spacing;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = i < p1Wins ? '#00F5FF' : '#2D1B4E';
    ctx.fill();
    ctx.strokeStyle = '#00F5FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Player 2 dots (right side)
  for (let i = 0; i < roundsToWin; i++) {
    const x = centerX + 50 + i * spacing;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = i < p2Wins ? '#FF00FF' : '#2D1B4E';
    ctx.fill();
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // VS text
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('VS', centerX, y + 5);
}

/**
 * Render fight announcement
 */
export function renderAnnouncement(
  ctx: CanvasRenderingContext2D,
  text: string,
  subtext?: string,
  progress = 1
): void {
  const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
  const scale = 1 + (1 - progress) * 0.2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.scale(scale, scale);

  // Main text
  ctx.font = 'bold 64px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#FF00FF';
  ctx.shadowBlur = 20;
  ctx.fillText(text, 0, 0);

  // Subtext
  if (subtext) {
    ctx.font = '24px "Courier New", monospace';
    ctx.fillStyle = '#00F5FF';
    ctx.shadowColor = '#00F5FF';
    ctx.fillText(subtext, 0, 40);
  }

  ctx.restore();
}

/**
 * Render full fight scene
 */
export function renderFightScene(
  ctx: CanvasRenderingContext2D,
  fightState: FightState,
  camera: Camera,
  presentation: FightPresentationOptions = {}
): void {
  const graphicsProfile = resolveFightGraphicsProfile(presentation);
  ctx.save();
  ctx.translate(camera.shakeOffsetX, camera.shakeOffsetY);
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

  // Background
  renderBackground(ctx, camera, fightState.frameCount, graphicsProfile);

  // Arena
  renderArena(ctx, camera, graphicsProfile);

  // Fighters (sorted by lane for proper layering)
  const fighters = [fightState.player1, fightState.player2];
  fighters.sort((a, b) => a.lane - b.lane);

  for (const effect of fightState.visualEffects.filter((effect) => effect.layer === 'behind')) {
    renderVisualEffect(ctx, effect);
  }

  for (const fighter of fighters) {
    renderAttackTelegraph(ctx, fighter, fightState.frameCount);
    for (const effect of collectAmbientEffectsForFighter(fighter, fightState.frameCount)) {
      if (effect.layer === 'behind') {
        renderAmbientEffect(ctx, effect);
      }
    }
    renderFighter(ctx, fighter, camera, fightState.frameCount);
    for (const effect of collectAmbientEffectsForFighter(fighter, fightState.frameCount)) {
      if (effect.layer === 'front') {
        renderAmbientEffect(ctx, effect);
      }
    }
  }

  for (const effect of fightState.visualEffects.filter((effect) => effect.layer === 'front')) {
    renderVisualEffect(ctx, effect);
  }

  fightState.particlePool.render(ctx);
  renderFightForeground(ctx, camera, fightState.frameCount, graphicsProfile);

  if (fightState.hitFreezeFrames > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.14, fightState.hitFreezeFrames * 0.04);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  ctx.restore();

  // Render screen effects on top of everything
  for (const screenEffect of fightState.screenEffects) {
    screenEffect.render(ctx);
  }

  renderCombatScreenFeedback(ctx, fightState);

  // HUD
  const p1Char = CHARACTERS[fightState.player1.characterId as keyof typeof CHARACTERS];
  const p2Char = CHARACTERS[fightState.player2.characterId as keyof typeof CHARACTERS];

  renderHealthBar(
    ctx,
    50,
    30,
    300,
    20,
    fightState.player1.health,
    fightState.player1.stats.maxHealth,
    p1Char?.colors.primary ?? '#00F5FF',
    p1Char?.name ?? 'P1',
    false
  );

  renderHealthBar(
    ctx,
    CANVAS_WIDTH - 350,
    30,
    300,
    20,
    fightState.player2.health,
    fightState.player2.stats.maxHealth,
    p2Char?.colors.primary ?? '#FF00FF',
    p2Char?.name ?? 'P2',
    true
  );

  renderSpecialMeter(
    ctx,
    fightState.player1,
    50,
    55,
    300,
    p1Char?.colors.accent ?? '#39FF14',
    false
  );
  renderSpecialMeter(
    ctx,
    fightState.player2,
    CANVAS_WIDTH - 350,
    55,
    300,
    p2Char?.colors.accent ?? '#FF9F1C',
    true
  );

  // Timer
  renderTimer(ctx, fightState.round.time);

  // Round indicator
  renderRoundIndicator(ctx, fightState.scores[0] ?? 0, fightState.scores[1] ?? 0, 2);

  // Combo displays
  if (fightState.combos[0]?.count > 1) {
    renderComboDisplay(ctx, 150, 150, fightState.combos[0].count, '#00F5FF');
  }
  if (fightState.combos[1]?.count > 1) {
    renderComboDisplay(ctx, CANVAS_WIDTH - 150, 150, fightState.combos[1].count, '#FF00FF');
  }
}
