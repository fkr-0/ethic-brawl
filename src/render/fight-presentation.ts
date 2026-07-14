import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';
import type { FightState } from '@/game/fight/fight-controller';
import type { Fighter } from '@/game/fight/fighter';
import type { Camera } from './camera';

export type FightArenaThemeId = 'neon_arena' | 'babylon';
export type GraphicsBackendId = 'canvas2d';
export type FightForegroundMotif =
  | 'arena_rail'
  | 'market_awning'
  | 'archive_columns'
  | 'gate_braziers';
export type FightAtmosphereMotif =
  | 'neon_rain'
  | 'market_streamers'
  | 'archive_data'
  | 'gate_embers';

export interface FightPresentationOptions {
  theme?: FightArenaThemeId;
  encounterIndex?: number;
}

function renderForegroundCrowd(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame: number,
  profile: FightGraphicsProfile
): void {
  ctx.save();
  ctx.fillStyle = '#05030A';
  for (let index = 0; index < 18; index += 1) {
    const worldX = index * 82 + profile.seed * 0.17;
    const x = calculateWrappedParallaxX(worldX, camera.x, 0.58, 1480, 90);
    const bob = Math.sin(frame * 0.045 + index * 1.7) * 2;
    const height = 24 + (index % 5) * 4;
    const y = CANVAS_HEIGHT - height + bob;
    ctx.globalAlpha = 0.42 + (index % 3) * 0.06;
    ctx.beginPath();
    ctx.arc(x + 11, y - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x, y - 4, 22, height);
    if (index % 4 === 0) {
      ctx.strokeStyle = `${profile.accent}55`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 11, y + 4);
      ctx.lineTo(x + 8 + Math.sin(frame * 0.08 + index) * 13, y - 19);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderFightForeground(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame: number,
  profile: FightGraphicsProfile
): void {
  renderForegroundCrowd(ctx, camera, frame, profile);

  ctx.save();
  switch (profile.foregroundMotif) {
    case 'market_awning': {
      ctx.globalAlpha = 0.9;
      for (const side of [-1, 1]) {
        const x = side < 0 ? -34 : CANVAS_WIDTH - 154;
        ctx.fillStyle = profile.floorColor;
        ctx.fillRect(x, CANVAS_HEIGHT - 160, 188, 160);
        ctx.fillStyle = profile.secondaryAccent;
        for (let strip = 0; strip < 5; strip += 1) {
          ctx.beginPath();
          ctx.moveTo(x + strip * 38, CANVAS_HEIGHT - 160);
          ctx.lineTo(x + strip * 38 + 28, CANVAS_HEIGHT - 160);
          ctx.lineTo(x + strip * 38 + 20, CANVAS_HEIGHT - 137);
          ctx.lineTo(x + strip * 38 + 6, CANVAS_HEIGHT - 137);
          ctx.fill();
        }
        ctx.fillStyle = `${profile.accent}44`;
        ctx.fillRect(x + 26, CANVAS_HEIGHT - 108, 130, 7);
      }
      break;
    }
    case 'archive_columns': {
      ctx.fillStyle = '#080610';
      ctx.globalAlpha = 0.88;
      ctx.fillRect(0, 0, 58, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - 58, 0, 58, CANVAS_HEIGHT);
      ctx.strokeStyle = `${profile.accent}77`;
      ctx.lineWidth = 2;
      for (let y = 24; y < CANVAS_HEIGHT; y += 36) {
        ctx.strokeRect(13, y, 32, 20);
        ctx.strokeRect(CANVAS_WIDTH - 45, y, 32, 20);
      }
      const scanY = positiveModulo(frame * 2.1, CANVAS_HEIGHT + 80) - 40;
      const scan = ctx.createLinearGradient(0, scanY - 28, 0, scanY + 28);
      scan.addColorStop(0, `${profile.accent}00`);
      scan.addColorStop(0.5, `${profile.accent}44`);
      scan.addColorStop(1, `${profile.accent}00`);
      ctx.fillStyle = scan;
      ctx.fillRect(58, scanY - 28, CANVAS_WIDTH - 116, 56);
      break;
    }
    case 'gate_braziers': {
      for (const x of [32, CANVAS_WIDTH - 92]) {
        ctx.fillStyle = '#100709';
        ctx.globalAlpha = 0.94;
        ctx.fillRect(x, CANVAS_HEIGHT - 210, 60, 210);
        ctx.fillStyle = profile.floorHighlight;
        ctx.fillRect(x + 8, CANVAS_HEIGHT - 204, 44, 9);
        const flameHeight = 26 + Math.sin(frame * 0.18 + x) * 7;
        const flame = ctx.createRadialGradient(
          x + 30,
          CANVAS_HEIGHT - 224,
          2,
          x + 30,
          CANVAS_HEIGHT - 224,
          38
        );
        flame.addColorStop(0, '#FFF2B0');
        flame.addColorStop(0.35, profile.accent);
        flame.addColorStop(1, `${profile.secondaryAccent}00`);
        ctx.fillStyle = flame;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.ellipse(x + 30, CANVAS_HEIGHT - 215, 26, flameHeight, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'arena_rail':
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = '#090512';
      ctx.fillRect(0, CANVAS_HEIGHT - 24, CANVAS_WIDTH, 24);
      ctx.fillStyle = profile.accent;
      for (let x = -20; x < CANVAS_WIDTH + 40; x += 54) {
        const offset = positiveModulo(x - frame * 0.55, CANVAS_WIDTH + 80) - 40;
        ctx.fillRect(offset, CANVAS_HEIGHT - 23, 26, 3);
      }
      break;
  }

  const bottomShade = ctx.createLinearGradient(0, CANVAS_HEIGHT - 110, 0, CANVAS_HEIGHT);
  bottomShade.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bottomShade.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, CANVAS_HEIGHT - 110, CANVAS_WIDTH, 110);
  ctx.restore();
}

export interface FightGraphicsProfile {
  id: string;
  backend: GraphicsBackendId;
  theme: FightArenaThemeId;
  encounterIndex: number;
  skyTop: string;
  skyMiddle: string;
  skyBottom: string;
  farColor: string;
  midColor: string;
  floorColor: string;
  floorHighlight: string;
  accent: string;
  secondaryAccent: string;
  haze: string;
  dust: string;
  signWords: readonly string[];
  foregroundMotif: FightForegroundMotif;
  atmosphereMotif: FightAtmosphereMotif;
  farParallaxSpeed: number;
  midParallaxSpeed: number;
  signParallaxSpeed: number;
  seed: number;
}

export interface AttackTelegraphState {
  progress: number;
  urgency: number;
  radius: number;
  alpha: number;
  lineWidth: number;
  color: string;
  label: string | null;
}

export interface CombatScreenFeedbackState {
  lowHealthAlpha: number;
  impactAlpha: number;
  dominantSide: 1 | 2 | null;
}

const NEON_ARENA_PROFILE: FightGraphicsProfile = {
  id: 'neon_arena',
  backend: 'canvas2d',
  theme: 'neon_arena',
  encounterIndex: 0,
  skyTop: '#080411',
  skyMiddle: '#150A28',
  skyBottom: '#281243',
  farColor: '#120A20',
  midColor: '#21113D',
  floorColor: '#24143D',
  floorHighlight: '#4D3B6E',
  accent: '#00F5FF',
  secondaryAccent: '#FF00FF',
  haze: 'rgba(64, 18, 96, 0.26)',
  dust: '#B8A9C9',
  signWords: ['TRUTH', 'ABSURD', 'DIALECTIC', 'POWER'],
  foregroundMotif: 'arena_rail',
  atmosphereMotif: 'neon_rain',
  farParallaxSpeed: 0.1,
  midParallaxSpeed: 0.24,
  signParallaxSpeed: 0.4,
  seed: 1337,
};

const BABYLON_PROFILES: readonly FightGraphicsProfile[] = [
  {
    id: 'babylon_market',
    backend: 'canvas2d',
    theme: 'babylon',
    encounterIndex: 0,
    skyTop: '#0B1021',
    skyMiddle: '#24162A',
    skyBottom: '#4C2B25',
    farColor: '#171425',
    midColor: '#2B1F2F',
    floorColor: '#35251F',
    floorHighlight: '#806047',
    accent: '#38E9E5',
    secondaryAccent: '#E5A94F',
    haze: 'rgba(229, 169, 79, 0.14)',
    dust: '#E8C48B',
    signWords: ['DEBT', 'MARKET', 'BRONZE LAW', 'TRIBUTE'],
    foregroundMotif: 'market_awning',
    atmosphereMotif: 'market_streamers',
    farParallaxSpeed: 0.12,
    midParallaxSpeed: 0.3,
    signParallaxSpeed: 0.46,
    seed: 701,
  },
  {
    id: 'babylon_archive',
    backend: 'canvas2d',
    theme: 'babylon',
    encounterIndex: 1,
    skyTop: '#080D1A',
    skyMiddle: '#171631',
    skyBottom: '#34203A',
    farColor: '#101525',
    midColor: '#221C35',
    floorColor: '#29203A',
    floorHighlight: '#604F75',
    accent: '#7CEBFF',
    secondaryAccent: '#E648C4',
    haze: 'rgba(77, 79, 150, 0.18)',
    dust: '#B8D7E9',
    signWords: ['ARCHIVE', 'OBEY', 'PROPERTY', 'RECORDED'],
    foregroundMotif: 'archive_columns',
    atmosphereMotif: 'archive_data',
    farParallaxSpeed: 0.075,
    midParallaxSpeed: 0.2,
    signParallaxSpeed: 0.34,
    seed: 1701,
  },
  {
    id: 'babylon_gate',
    backend: 'canvas2d',
    theme: 'babylon',
    encounterIndex: 2,
    skyTop: '#12070A',
    skyMiddle: '#311116',
    skyBottom: '#5A2C20',
    farColor: '#1D1114',
    midColor: '#351B1A',
    floorColor: '#3C241C',
    floorHighlight: '#8C5A36',
    accent: '#FFB24C',
    secondaryAccent: '#FF4D6D',
    haze: 'rgba(255, 85, 52, 0.16)',
    dust: '#F0B26C',
    signWords: ['GATE', 'THE PRINCE', 'NO APPEAL', 'FORTUNE'],
    foregroundMotif: 'gate_braziers',
    atmosphereMotif: 'gate_embers',
    farParallaxSpeed: 0.16,
    midParallaxSpeed: 0.36,
    signParallaxSpeed: 0.54,
    seed: 2701,
  },
];

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function getGraphicsBackendStatus(): {
  backend: GraphicsBackendId;
  pixiInstalled: false;
  rendererNeutralPresentation: true;
} {
  return {
    backend: 'canvas2d',
    pixiInstalled: false,
    rendererNeutralPresentation: true,
  };
}

export function resolveFightGraphicsProfile(
  options: FightPresentationOptions = {}
): FightGraphicsProfile {
  if (options.theme !== 'babylon') return NEON_ARENA_PROFILE;
  const encounterIndex = Math.max(
    0,
    Math.min(BABYLON_PROFILES.length - 1, options.encounterIndex ?? 0)
  );
  return BABYLON_PROFILES[encounterIndex] ?? BABYLON_PROFILES[0] ?? NEON_ARENA_PROFILE;
}

export function calculateWrappedParallaxX(
  elementX: number,
  cameraX: number,
  speed: number,
  repeatWidth: number,
  overscan = 160
): number {
  return positiveModulo(elementX - cameraX * speed + overscan, repeatWidth) - overscan;
}

export function resolveAttackTelegraph(
  fighter: Pick<Fighter, 'state' | 'currentAttack' | 'attackFrame' | 'character'>
): AttackTelegraphState | null {
  const attack = fighter.currentAttack;
  if (!attack || (fighter.state !== 'attacking' && fighter.state !== 'special')) return null;
  if (attack.startup <= 0 || fighter.attackFrame >= attack.startup) return null;

  const progress = Math.max(0, Math.min(1, fighter.attackFrame / attack.startup));
  const urgency = 1 - progress;
  const isSpecial = attack.type === 'special' || fighter.state === 'special';
  return {
    progress,
    urgency,
    radius: 18 + urgency * (isSpecial ? 34 : 22),
    alpha: 0.22 + progress * (isSpecial ? 0.62 : 0.48),
    lineWidth: isSpecial ? 4 : 2.5,
    color: isSpecial ? fighter.character.colors.accent : fighter.character.colors.secondary,
    label: isSpecial ? attack.name.toUpperCase() : null,
  };
}

export function resolveCombatScreenFeedback(state: FightState): CombatScreenFeedbackState {
  const p1Ratio = state.player1.health / Math.max(1, state.player1.stats.maxHealth);
  const p2Ratio = state.player2.health / Math.max(1, state.player2.stats.maxHealth);
  const minimumRatio = Math.min(p1Ratio, p2Ratio);
  const lowHealthAlpha = minimumRatio < 0.35 ? Math.min(0.22, (0.35 - minimumRatio) * 0.5) : 0;
  const p1Impact = Math.max(state.player1.hitstunFrames, state.player1.blockstunFrames);
  const p2Impact = Math.max(state.player2.hitstunFrames, state.player2.blockstunFrames);
  const impactFrames = Math.max(p1Impact, p2Impact);

  return {
    lowHealthAlpha,
    impactAlpha: Math.min(0.16, impactFrames * 0.012),
    dominantSide: p1Impact === p2Impact ? null : p1Impact > p2Impact ? 1 : 2,
  };
}

export function renderFightBackdrop(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame: number,
  profile: FightGraphicsProfile
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, profile.skyTop);
  sky.addColorStop(0.55, profile.skyMiddle);
  sky.addColorStop(1, profile.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const repeatWidth = 1280;
  const random = createSeededRandom(profile.seed);

  ctx.save();
  ctx.globalAlpha = 0.72;
  for (let index = 0; index < 18; index += 1) {
    const width = 54 + Math.floor(random() * 62);
    const height = 86 + Math.floor(random() * 122);
    const worldX = index * 92 + random() * 45;
    const x = calculateWrappedParallaxX(worldX, camera.x, profile.farParallaxSpeed, repeatWidth);
    const y = CANVAS_HEIGHT - 102 - height;
    ctx.fillStyle = profile.farColor;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = `${profile.accent}22`;
    ctx.fillRect(x + 12, y + 16, 5, Math.max(8, height - 32));
  }
  ctx.restore();

  ctx.save();
  switch (profile.atmosphereMotif) {
    case 'market_streamers':
      for (let index = 0; index < 18; index += 1) {
        const drift = frame * (0.7 + (index % 4) * 0.12);
        const x = positiveModulo(index * 79 + drift - camera.x * 0.22, CANVAS_WIDTH + 100) - 50;
        const y = 90 + positiveModulo(index * 53 + frame * 0.18, 310);
        ctx.globalAlpha = 0.16 + (index % 3) * 0.04;
        ctx.fillStyle = index % 2 === 0 ? profile.accent : profile.secondaryAccent;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(frame * 0.04 + index) * 0.5);
        ctx.fillRect(-8, -2, 16 + (index % 4) * 3, 4);
        ctx.restore();
      }
      break;
    case 'archive_data':
      ctx.font = '11px "Courier New", monospace';
      ctx.textAlign = 'center';
      for (let column = 0; column < 15; column += 1) {
        const x = 36 + column * 66 - camera.x * 0.06;
        const offset = positiveModulo(frame * (1.4 + (column % 4) * 0.18) + column * 37, 430);
        for (let row = 0; row < 6; row += 1) {
          const y = positiveModulo(offset + row * 73, 430) + 58;
          ctx.globalAlpha = 0.04 + row * 0.018;
          ctx.fillStyle = column % 3 === 0 ? profile.secondaryAccent : profile.accent;
          ctx.fillText(String.fromCodePoint(0x12000 + ((column * 11 + row * 7) % 80)), x, y);
        }
      }
      break;
    case 'gate_embers':
      for (let index = 0; index < 42; index += 1) {
        const speed = 0.55 + (index % 7) * 0.13;
        const x = positiveModulo(
          index * 47 + Math.sin(frame * 0.02 + index) * 25 - camera.x * 0.12,
          CANVAS_WIDTH
        );
        const y = CANVAS_HEIGHT - positiveModulo(frame * speed + index * 61, CANVAS_HEIGHT - 70);
        const size = 1 + (index % 3);
        ctx.globalAlpha = 0.1 + (index % 5) * 0.04;
        ctx.fillStyle = index % 4 === 0 ? '#FFF2B0' : profile.accent;
        ctx.fillRect(x, y, size, size * 1.8);
      }
      break;
    case 'neon_rain':
      ctx.strokeStyle = `${profile.accent}24`;
      ctx.lineWidth = 1;
      for (let index = 0; index < 28; index += 1) {
        const x =
          positiveModulo(index * 41 + frame * 1.8 - camera.x * 0.18, CANVAS_WIDTH + 40) - 20;
        const y = positiveModulo(index * 83 + frame * 4.2, CANVAS_HEIGHT + 80) - 80;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 4, y + 22);
        ctx.stroke();
      }
      break;
  }
  ctx.restore();

  ctx.save();
  for (let index = 0; index < 12; index += 1) {
    const width = 82 + Math.floor(random() * 70);
    const height = 124 + Math.floor(random() * 150);
    const worldX = index * 128 + random() * 55;
    const x = calculateWrappedParallaxX(worldX, camera.x, profile.midParallaxSpeed, repeatWidth);
    const y = CANVAS_HEIGHT - 96 - height;
    ctx.fillStyle = profile.midColor;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = index % 2 === 0 ? `${profile.accent}55` : `${profile.secondaryAccent}55`;
    for (let windowY = y + 18; windowY < y + height - 16; windowY += 28) {
      ctx.fillRect(x + 14, windowY, Math.max(8, width - 28), 4);
    }
  }
  ctx.restore();

  if (profile.theme === 'babylon') {
    ctx.save();
    const gateWidth = 250 + profile.encounterIndex * 45;
    const gateX = CANVAS_WIDTH / 2 - gateWidth / 2 - (camera.x - CANVAS_WIDTH / 2) * 0.08;
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = profile.secondaryAccent;
    for (let tier = 0; tier < 5; tier += 1) {
      const tierWidth = gateWidth - tier * 34;
      ctx.fillRect(gateX + tier * 17, 286 - tier * 35, tierWidth, 34);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.textAlign = 'center';
  for (let index = 0; index < profile.signWords.length; index += 1) {
    const word = profile.signWords[index] ?? '';
    const worldX = 120 + index * 310;
    const x = calculateWrappedParallaxX(worldX, camera.x, profile.signParallaxSpeed, repeatWidth);
    const y = 128 + (index % 3) * 48;
    ctx.globalAlpha = 0.48 + Math.sin(frame * 0.04 + index) * 0.12;
    ctx.fillStyle = index % 2 === 0 ? profile.accent : profile.secondaryAccent;
    ctx.fillText(word, x, y);
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = `${profile.accent}33`;
  ctx.lineWidth = 1;
  for (let cable = 0; cable < 5; cable += 1) {
    const y = 72 + cable * 32;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(240, y + 34, 690, y - 28, CANVAS_WIDTH, y + 18);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = profile.dust;
  for (let index = 0; index < 34; index += 1) {
    const phase = frame * (0.12 + (index % 5) * 0.02) + index * 47;
    const x = positiveModulo(index * 83 + phase, CANVAS_WIDTH + 80) - 40;
    const y = 82 + positiveModulo(index * 61 + phase * 0.22, CANVAS_HEIGHT - 150);
    ctx.globalAlpha = 0.035 + (index % 4) * 0.012;
    ctx.fillRect(x, y, 2 + (index % 3), 2 + (index % 2));
  }
  ctx.restore();

  ctx.fillStyle = profile.haze;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function renderAttackTelegraph(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  frame: number
): void {
  const telegraph = resolveAttackTelegraph(fighter);
  if (!telegraph) return;

  const pulse = 1 + Math.sin(frame * 0.45) * 0.06;
  ctx.save();
  ctx.translate(fighter.x, fighter.getWorldY() - 48);
  ctx.globalAlpha = telegraph.alpha;
  ctx.strokeStyle = telegraph.color;
  ctx.fillStyle = telegraph.color;
  ctx.lineWidth = telegraph.lineWidth;
  ctx.shadowColor = telegraph.color;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(0, 0, telegraph.radius * pulse, 0, Math.PI * 2);
  ctx.stroke();

  const direction = fighter.facing === 'right' ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(direction * (telegraph.radius + 6), -7);
  ctx.lineTo(direction * (telegraph.radius + 20), 0);
  ctx.lineTo(direction * (telegraph.radius + 6), 7);
  ctx.fill();

  if (telegraph.label) {
    ctx.globalAlpha = Math.min(1, telegraph.alpha + 0.18);
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(telegraph.label.slice(0, 24), 0, -telegraph.radius - 12);
  }
  ctx.restore();
}

export function renderCombatScreenFeedback(ctx: CanvasRenderingContext2D, state: FightState): void {
  const feedback = resolveCombatScreenFeedback(state);
  if (feedback.lowHealthAlpha <= 0 && feedback.impactAlpha <= 0) return;

  ctx.save();
  const centerX =
    feedback.dominantSide === 1
      ? CANVAS_WIDTH * 0.35
      : feedback.dominantSide === 2
        ? CANVAS_WIDTH * 0.65
        : CANVAS_WIDTH / 2;
  const gradient = ctx.createRadialGradient(
    centerX,
    CANVAS_HEIGHT / 2,
    CANVAS_HEIGHT * 0.14,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.72
  );
  gradient.addColorStop(0, 'rgba(255, 44, 86, 0)');
  gradient.addColorStop(
    1,
    `rgba(255, 36, 72, ${Math.min(0.34, feedback.lowHealthAlpha + feedback.impactAlpha)})`
  );
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.restore();
}
