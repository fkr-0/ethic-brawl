/**
 * Main canvas renderer
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';
import { CHARACTERS } from '@/content/characters/character-data';
import { getComboDisplayText } from '@/game/fight/combo';
import { type FightState, getLaneGroundY } from '@/game/fight/fight-controller';
import type { Fighter } from '@/game/fight/fighter';
import { DEFAULT_BACKGROUND_SCENE } from './background-scene';
import { type Camera, getCameraTransform } from './camera';
import { createFighterAnimationView } from './fighter-animation-view';
import {
  canRenderSprites,
  createAnimationPlayerState,
  getAttackPhaseClip,
  getCharacterAnimationMap,
  getSpriteScaleFactor,
  getStateClip,
  playClip,
  renderFighterSprite,
  resolveAttackPhase,
  updateAnimationPlayer,
} from './sprites';
import type { CharacterAnimationMap } from './sprites';
import { collectAmbientEffectsForFighter, renderAmbientEffect, renderVisualEffect } from './vfx';

/**
 * Global sprite rendering toggle
 */
export let SPRITE_RENDERING_ENABLED = true;

export function setSpriteRendering(enabled: boolean): void {
  SPRITE_RENDERING_ENABLED = enabled;
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
export function renderBackground(ctx: CanvasRenderingContext2D, camera: Camera): void {
  const transform = getCameraTransform(camera);

  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#0D0518');
  gradient.addColorStop(0.45, '#1A0A2E');
  gradient.addColorStop(1, '#2D1B4E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.fillStyle = '#150A24';
  for (const building of DEFAULT_BACKGROUND_SCENE.distantBuildings) {
    const x = ((building.x + transform.offsetX * 0.1) % (CANVAS_WIDTH + 160)) - 80;
    ctx.fillRect(x, CANVAS_HEIGHT - 100 - building.height, building.width, building.height);
  }

  for (const building of DEFAULT_BACKGROUND_SCENE.midBuildings) {
    const x = ((building.x + transform.offsetX * 0.3) % (CANVAS_WIDTH + 240)) - 120;
    const topY = CANVAS_HEIGHT - 100 - building.height;
    ctx.fillStyle = '#1F1040';
    ctx.fillRect(x, topY, building.width, building.height);

    ctx.fillStyle = '#00F5FF33';
    for (const window of building.windows) {
      if (!window.lit) {
        continue;
      }
      ctx.fillRect(x + window.x, topY + window.y, window.width, window.height);
    }
  }

  ctx.font = '12px "Courier New", monospace';
  for (const sign of DEFAULT_BACKGROUND_SCENE.signs) {
    ctx.fillStyle = sign.color;
    ctx.fillText(sign.text, sign.x + transform.offsetX * sign.speedFactor, sign.y);
  }
  ctx.restore();
}

/**
 * Render ground/arena
 */
export function renderArena(ctx: CanvasRenderingContext2D, _camera: Camera): void {
  // Ground
  ctx.fillStyle = '#2D1B4E';
  ctx.fillRect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

  // Lane lines
  ctx.strokeStyle = '#4D3B6E';
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
  edgeGradientLeft.addColorStop(0, '#FF00FF44');
  edgeGradientLeft.addColorStop(1, 'transparent');
  ctx.fillStyle = edgeGradientLeft;
  ctx.fillRect(0, 0, 50, CANVAS_HEIGHT);

  const edgeGradientRight = ctx.createLinearGradient(CANVAS_WIDTH - 50, 0, CANVAS_WIDTH, 0);
  edgeGradientRight.addColorStop(0, 'transparent');
  edgeGradientRight.addColorStop(1, '#00F5FF44');
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
  const animMap = getCharacterAnimationMap(
    fighter.characterId as 'camus' | 'diogenes' | 'machiavelli' | 'leibniz'
  );

  const useSprites =
    SPRITE_RENDERING_ENABLED && animMap && canRenderSprites(animMap, fighter.characterId);

  if (useSprites) {
    renderFighterWithSprite(ctx, fighter, animMap, frame);
  } else {
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
  _frame: number
): void {
  const animState = getFighterAnimationState(fighter.id);
  let targetClip: ReturnType<typeof getStateClip> | ReturnType<typeof getAttackPhaseClip> | null =
    null;

  if (fighter.state === 'attacking' || fighter.state === 'special') {
    if (fighter.currentAttack) {
      const phase = resolveAttackPhase(
        fighter.attackFrame,
        fighter.currentAttack.startup,
        fighter.currentAttack.active,
        fighter.currentAttack.recovery
      );
      targetClip = getAttackPhaseClip(animMap, fighter.currentAttack.id, phase);
    }
  }

  if (!targetClip) {
    targetClip = getStateClip(animMap, fighter.state);
  }

  // Override state for landing - if fighter is landing but state shows jumping/falling, use idle clip
  if (fighter.landingFrames > 0 && (fighter.state === 'jumping' || fighter.state === 'falling')) {
    targetClip = getStateClip(animMap, 'idle');
  }

  // Update the last known state
  fighterLastStateCache.set(fighter.id, fighter.state);
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
  const previousState = fighterLastStateCache.get(fighter.id);
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
    const newState = playClip(animState, effectiveClip, 1);
    Object.assign(animState, newState);
  }

  const updatedState = updateAnimationPlayer(animState, 1);
  Object.assign(animState, updatedState);

  const screenX = fighter.x;
  const screenY = fighter.getWorldY();
  const facingRight = fighter.facing === 'right';
  const depthScale = getSpriteScaleFactor();

  if (!animState.currentClip || !animMap.atlas) {
    console.warn(`Missing clip or atlas for ${fighter.characterId}, falling back to procedural`);
    renderFighterProcedural(
      ctx,
      fighter,
      { x: 0, y: 0, zoom: 1, shakeOffsetX: 0, shakeOffsetY: 0 } as Camera,
      _frame
    );
    return;
  }

  const rendered = renderFighterSprite(
    ctx,
    animMap,
    animState.currentClip,
    animState.currentFrame,
    screenX,
    screenY,
    facingRight,
    depthScale,
    1,
    fighter.characterId
  );

  if (!rendered) {
    // Fall back to procedural rendering when sprites fail
    renderFighterProcedural(
      ctx,
      fighter,
      { x: 0, y: 0, zoom: 1, shakeOffsetX: 0, shakeOffsetY: 0 } as Camera,
      _frame
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
  camera: Camera
): void {
  ctx.save();
  ctx.translate(camera.shakeOffsetX, camera.shakeOffsetY);
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);

  // Background
  renderBackground(ctx, camera);

  // Arena
  renderArena(ctx, camera);

  // Fighters (sorted by lane for proper layering)
  const fighters = [fightState.player1, fightState.player2];
  fighters.sort((a, b) => a.lane - b.lane);

  for (const effect of fightState.visualEffects.filter((effect) => effect.layer === 'behind')) {
    renderVisualEffect(ctx, effect);
  }

  for (const fighter of fighters) {
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

  // Render particle systems
  for (const particleSystem of fightState.particleSystems) {
    particleSystem.render(ctx);
  }

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
