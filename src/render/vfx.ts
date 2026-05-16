import type {
  CharacterAmbientVfxPresetId,
  CharacterAnimationProfile,
} from '@/content/characters/character-data';
import type { Fighter } from '@/game/fight/fighter';
import type { FightVisualEffect } from '@/game/fight/visual-effects';
import { clamp } from '@/utils/math';
import { createFighterAnimationView } from './fighter-animation-view';

export type AmbientVisualEffectPresetId =
  | 'ambient_absurd_motes'
  | 'ambient_monad_orbit'
  | 'ambient_scheme_smoke'
  | 'ambient_lantern_flicker'
  | 'movement_afterglow'
  | 'guard_shimmer'
  | 'special_monad_orbit'
  | 'landing_dust';

export interface AmbientVisualEffect {
  preset: AmbientVisualEffectPresetId;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
  layer: 'behind' | 'front';
}

const AMBIENT_PRESET_MAP: Record<CharacterAmbientVfxPresetId, AmbientVisualEffectPresetId> = {
  absurd_motes: 'ambient_absurd_motes',
  monad_orbit: 'ambient_monad_orbit',
  scheme_smoke: 'ambient_scheme_smoke',
  lantern_flicker: 'ambient_lantern_flicker',
};

function getCharacterAmbientColor(preset: CharacterAmbientVfxPresetId): string {
  switch (preset) {
    case 'monad_orbit':
      return '#39FF14';
    case 'scheme_smoke':
      return '#FF00FF';
    case 'lantern_flicker':
      return '#FFD700';
    default:
      return '#00F5FF';
  }
}

function getCharacterAnimationProfile(fighter: Fighter): CharacterAnimationProfile {
  return fighter.character.animation;
}

export function collectAmbientEffectsForFighter(
  fighter: Fighter,
  frame: number
): AmbientVisualEffect[] {
  const profile = getCharacterAnimationProfile(fighter);
  const view = createFighterAnimationView(fighter, frame);
  const effects: AmbientVisualEffect[] = [];
  const baseX = fighter.x;
  const baseY = fighter.getWorldY() - 62 + view.bobOffsetY;
  const pulse = 0.7 + Math.sin(frame * 0.1 + profile.visualSeed) * 0.18;

  effects.push({
    preset: AMBIENT_PRESET_MAP[profile.ambientPreset],
    x: baseX + Math.sin(frame * 0.03 + profile.visualSeed) * 8,
    y: baseY - Math.cos(frame * 0.04 + profile.visualSeed) * 4,
    radius: 8 + profile.idleBreath * 4,
    alpha: clamp(0.12 * pulse, 0.05, 0.26),
    color: getCharacterAmbientColor(profile.ambientPreset),
    layer: 'behind',
  });

  if (fighter.state === 'running' || Math.abs(fighter.moveVelocityX) > 4.5) {
    effects.push({
      preset: 'movement_afterglow',
      x: fighter.x - (fighter.facing === 'right' ? 12 : -12),
      y: fighter.getWorldY() - 38,
      radius: 14 + profile.legStride * 5,
      alpha: 0.16,
      color: fighter.character.colors.accent,
      layer: 'behind',
    });
  }

  if (fighter.isBlocking || fighter.blockstunFrames > 0) {
    effects.push({
      preset: 'guard_shimmer',
      x: fighter.x + (fighter.facing === 'right' ? 12 : -12),
      y: fighter.getWorldY() - 42,
      radius: 20,
      alpha: 0.18 + fighter.blockstunFrames * 0.015,
      color: '#00F5FF',
      layer: 'front',
    });
  }

  if (fighter.state === 'special') {
    effects.push({
      preset: fighter.characterId === 'leibniz' ? 'special_monad_orbit' : 'movement_afterglow',
      x: fighter.x,
      y: fighter.getWorldY() - 52,
      radius: 22 + profile.airborneFloat * 4,
      alpha: 0.22,
      color: fighter.character.colors.accent,
      layer: 'front',
    });
  }

  if (fighter.landingFrames > 0) {
    effects.push({
      preset: 'landing_dust',
      x: fighter.x,
      y: fighter.getWorldY() - 2,
      radius: 18 + fighter.landingFrames,
      alpha: 0.18,
      color: fighter.character.colors.secondary,
      layer: 'behind',
    });
  }

  return effects;
}

function renderBurstLines(
  ctx: CanvasRenderingContext2D,
  count: number,
  inner: number,
  outer: number
): void {
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    ctx.stroke();
  }
}

export function renderVisualEffect(
  ctx: CanvasRenderingContext2D,
  effect: Pick<FightVisualEffect, 'preset' | 'x' | 'y' | 'ttl' | 'totalTtl' | 'scale' | 'color'>
): void {
  const alpha = clamp(effect.ttl / Math.max(1, effect.totalTtl), 0, 1);
  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = effect.color;
  ctx.fillStyle = effect.color;
  ctx.lineWidth = 3;
  ctx.shadowColor = effect.color;
  ctx.shadowBlur = 12;

  switch (effect.preset) {
    case 'block_guard':
      ctx.beginPath();
      ctx.arc(0, 0, 22 * effect.scale, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    case 'perfect_guard':
      ctx.beginPath();
      ctx.arc(0, 0, 26 * effect.scale, 0, Math.PI * 2);
      ctx.stroke();
      renderBurstLines(ctx, 8, 8 * effect.scale, 20 * effect.scale);
      break;
    case 'launcher_pop':
      renderBurstLines(ctx, 10, 6 * effect.scale, 22 * effect.scale);
      ctx.beginPath();
      ctx.arc(0, 0, 8 * effect.scale, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'landing_dust':
      ctx.beginPath();
      ctx.ellipse(0, 0, 18 * effect.scale, 8 * effect.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'special_burst':
      ctx.beginPath();
      ctx.arc(0, 0, 20 * effect.scale, 0, Math.PI * 2);
      ctx.stroke();
      renderBurstLines(ctx, 12, 10 * effect.scale, 28 * effect.scale);
      break;
    case 'startup_flash':
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 * effect.scale, 24 * effect.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'swing_arc_light':
    case 'swing_arc_medium':
    case 'swing_arc_heavy':
    case 'swing_arc_special': {
      const radius =
        effect.preset === 'swing_arc_light'
          ? 18
          : effect.preset === 'swing_arc_medium'
            ? 24
            : effect.preset === 'swing_arc_heavy'
              ? 30
              : 34;
      ctx.beginPath();
      ctx.arc(0, 0, radius * effect.scale, -Math.PI * 0.75, Math.PI * 0.15);
      ctx.stroke();
      renderBurstLines(ctx, 4, radius * 0.4 * effect.scale, radius * 0.9 * effect.scale);
      break;
    }
    case 'recovery_echo':
      ctx.beginPath();
      ctx.ellipse(0, 0, 20 * effect.scale, 10 * effect.scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'special_sigils':
      ctx.beginPath();
      ctx.arc(0, 0, 18 * effect.scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14 * effect.scale, 0);
      ctx.lineTo(14 * effect.scale, 0);
      ctx.moveTo(0, -14 * effect.scale);
      ctx.lineTo(0, 14 * effect.scale);
      ctx.stroke();
      break;
    default:
      renderBurstLines(
        ctx,
        effect.preset === 'hit_spark_light' ? 5 : effect.preset === 'hit_spark_medium' ? 7 : 9,
        3 * effect.scale,
        14 * effect.scale
      );
      break;
  }

  ctx.restore();
}

export function renderAmbientEffect(
  ctx: CanvasRenderingContext2D,
  effect: AmbientVisualEffect
): void {
  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.globalAlpha = effect.alpha;
  ctx.fillStyle = effect.color;
  ctx.strokeStyle = effect.color;
  ctx.shadowColor = effect.color;
  ctx.shadowBlur = 10;

  switch (effect.preset) {
    case 'ambient_monad_orbit':
    case 'special_monad_orbit':
      for (let index = 0; index < 3; index++) {
        const orbitAngle = (index / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          Math.cos(orbitAngle) * effect.radius,
          Math.sin(orbitAngle) * effect.radius * 0.45,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      break;
    case 'ambient_scheme_smoke':
      ctx.beginPath();
      ctx.ellipse(0, 0, effect.radius, effect.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'ambient_lantern_flicker':
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'guard_shimmer':
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.ellipse(0, 0, effect.radius, effect.radius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}
