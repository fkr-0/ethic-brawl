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
export type FightStageEventId =
  | 'signal_surge'
  | 'market_caravan'
  | 'archive_scan'
  | 'gate_heat_wave';
export type FightStageEventPhase = 'idle' | 'warning' | 'active' | 'release';

export interface FightStageEventState {
  id: FightStageEventId;
  label: string;
  phase: FightStageEventPhase;
  cycleFrame: number;
  cycleProgress: number;
  phaseProgress: number;
  intensity: number;
}

export interface FightStageReactionState {
  crowdEnergy: number;
  lightPulse: number;
  impactPulse: number;
  healthPressure: number;
  comboEnergy: number;
}

export function resolveFightStageReaction(
  state: FightState | null,
  event: FightStageEventState
): FightStageReactionState {
  if (!state) {
    return {
      crowdEnergy: event.intensity * 0.42,
      lightPulse: event.intensity * 0.58,
      impactPulse: 0,
      healthPressure: 0,
      comboEnergy: 0,
    };
  }

  const p1Ratio = state.player1.health / Math.max(1, state.player1.stats.maxHealth);
  const p2Ratio = state.player2.health / Math.max(1, state.player2.stats.maxHealth);
  const healthPressure = Math.max(0, Math.min(1, 1 - Math.min(p1Ratio, p2Ratio)));
  const comboCount = Math.max(state.combos[0]?.count ?? 0, state.combos[1]?.count ?? 0);
  const comboEnergy = Math.max(0, Math.min(1, comboCount / 8));
  const stunFrames = Math.max(
    state.player1.hitstunFrames,
    state.player1.blockstunFrames,
    state.player2.hitstunFrames,
    state.player2.blockstunFrames
  );
  const impactPulse = Math.max(0, Math.min(1, state.hitFreezeFrames / 5 + stunFrames / 18));
  const crowdEnergy = Math.max(
    0,
    Math.min(
      1,
      0.12 +
        event.intensity * 0.38 +
        healthPressure * 0.22 +
        comboEnergy * 0.34 +
        impactPulse * 0.42
    )
  );

  return {
    crowdEnergy,
    lightPulse: Math.max(0, Math.min(1, event.intensity * 0.68 + impactPulse * 0.5)),
    impactPulse,
    healthPressure,
    comboEnergy,
  };
}

export function resolveFightStageEvent(
  frame: number,
  profile: FightGraphicsProfile
): FightStageEventState {
  const period = Math.max(1, profile.stageEventPeriod);
  const cycleFrame = positiveModulo(frame + profile.seed, period);
  const warningStart = Math.max(
    0,
    period -
      profile.stageEventWarningFrames -
      profile.stageEventActiveFrames -
      profile.stageEventReleaseFrames
  );
  const activeStart = warningStart + profile.stageEventWarningFrames;
  const releaseStart = activeStart + profile.stageEventActiveFrames;

  let phase: FightStageEventPhase = 'idle';
  let phaseProgress = warningStart > 0 ? cycleFrame / warningStart : 0;
  let intensity = 0;

  if (cycleFrame >= releaseStart) {
    phase = 'release';
    phaseProgress = (cycleFrame - releaseStart) / Math.max(1, profile.stageEventReleaseFrames - 1);
    intensity = 1 - phaseProgress;
  } else if (cycleFrame >= activeStart) {
    phase = 'active';
    phaseProgress = (cycleFrame - activeStart) / Math.max(1, profile.stageEventActiveFrames - 1);
    intensity = 0.74 + Math.sin(phaseProgress * Math.PI) * 0.26;
  } else if (cycleFrame >= warningStart) {
    phase = 'warning';
    phaseProgress = (cycleFrame - warningStart) / Math.max(1, profile.stageEventWarningFrames - 1);
    intensity = phaseProgress * 0.72;
  }

  return {
    id: profile.stageEventId,
    label: profile.stageEventLabel,
    phase,
    cycleFrame,
    cycleProgress: cycleFrame / period,
    phaseProgress: Math.max(0, Math.min(1, phaseProgress)),
    intensity: Math.max(0, Math.min(1, intensity)),
  };
}

function renderStageEventBackdrop(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame: number,
  profile: FightGraphicsProfile,
  event: FightStageEventState
): void {
  if (event.phase === 'idle') return;

  ctx.save();
  switch (event.id) {
    case 'market_caravan': {
      const travel = event.cycleProgress * (CANVAS_WIDTH + 420);
      const caravanX = CANVAS_WIDTH + 170 - travel - camera.x * 0.12;
      ctx.globalAlpha = 0.3 + event.intensity * 0.45;
      for (let cart = 0; cart < 4; cart += 1) {
        const x = caravanX + cart * 132;
        const y = CANVAS_HEIGHT - 154 + Math.sin(frame * 0.09 + cart) * 2;
        ctx.fillStyle = cart % 2 === 0 ? profile.secondaryAccent : profile.midColor;
        ctx.fillRect(x, y - 36, 96, 34);
        ctx.fillStyle = profile.floorColor;
        ctx.fillRect(x + 9, y - 52, 78, 18);
        ctx.fillStyle = `${profile.accent}CC`;
        ctx.fillRect(x + 18, y - 47, 6, 9);
        ctx.fillRect(x + 70, y - 47, 6, 9);
        ctx.fillStyle = '#08060C';
        ctx.beginPath();
        ctx.arc(x + 20, y, 12, 0, Math.PI * 2);
        ctx.arc(x + 76, y, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'archive_scan': {
      const sweep = event.phase === 'warning' ? event.phaseProgress * 0.18 : event.phaseProgress;
      const x = 70 + sweep * (CANVAS_WIDTH - 140);
      const beam = ctx.createLinearGradient(x - 76, 0, x + 76, 0);
      beam.addColorStop(0, `${profile.accent}00`);
      beam.addColorStop(0.5, `${profile.accent}${event.phase === 'active' ? '66' : '33'}`);
      beam.addColorStop(1, `${profile.accent}00`);
      ctx.fillStyle = beam;
      ctx.fillRect(x - 76, 84, 152, CANVAS_HEIGHT - 164);
      ctx.strokeStyle = `${profile.secondaryAccent}88`;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.35 + event.intensity * 0.5;
      for (let row = 0; row < 7; row += 1) {
        const y = 104 + row * 48;
        ctx.strokeRect(x - 44 - (row % 2) * 18, y, 88 + (row % 3) * 24, 19);
      }
      break;
    }
    case 'gate_heat_wave': {
      const pulse = 0.72 + event.intensity * 0.28;
      const glow = ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - 180,
        18,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - 180,
        290 * pulse
      );
      glow.addColorStop(0, `${profile.accent}88`);
      glow.addColorStop(0.45, `${profile.secondaryAccent}33`);
      glow.addColorStop(1, `${profile.secondaryAccent}00`);
      ctx.fillStyle = glow;
      ctx.globalAlpha = 0.38 + event.intensity * 0.42;
      ctx.fillRect(120, 74, CANVAS_WIDTH - 240, CANVAS_HEIGHT - 128);
      ctx.strokeStyle = `${profile.accent}66`;
      ctx.lineWidth = 2;
      for (let wave = 0; wave < 5; wave += 1) {
        const y = CANVAS_HEIGHT - 128 - wave * 24;
        ctx.beginPath();
        for (let x = 100; x <= CANVAS_WIDTH - 100; x += 18) {
          const offset = Math.sin(x * 0.045 + frame * 0.11 + wave) * 5 * event.intensity;
          if (x === 100) ctx.moveTo(x, y + offset);
          else ctx.lineTo(x, y + offset);
        }
        ctx.stroke();
      }
      break;
    }
    case 'signal_surge': {
      ctx.globalAlpha = 0.18 + event.intensity * 0.36;
      for (let band = 0; band < 6; band += 1) {
        const y = 92 + band * 58 + Math.sin(frame * 0.06 + band) * 8;
        const gradient = ctx.createLinearGradient(0, y, CANVAS_WIDTH, y);
        gradient.addColorStop(0, `${profile.secondaryAccent}00`);
        gradient.addColorStop(0.5, band % 2 === 0 ? profile.accent : profile.secondaryAccent);
        gradient.addColorStop(1, `${profile.accent}00`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + event.intensity * 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(220, y - 24, 720, y + 28, CANVAS_WIDTH, y - 6);
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

function renderStageEventForeground(
  ctx: CanvasRenderingContext2D,
  frame: number,
  profile: FightGraphicsProfile,
  event: FightStageEventState
): void {
  if (event.phase === 'idle') return;

  ctx.save();
  if (event.id === 'archive_scan') {
    const x = 70 + event.phaseProgress * (CANVAS_WIDTH - 140);
    ctx.globalAlpha = 0.12 + event.intensity * 0.28;
    ctx.fillStyle = profile.accent;
    ctx.fillRect(x - 2, 78, 4, CANVAS_HEIGHT - 118);
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(event.label, x, 94);
  } else if (event.id === 'gate_heat_wave') {
    ctx.globalAlpha = event.intensity * 0.12;
    ctx.fillStyle = profile.accent;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else if (event.id === 'market_caravan') {
    ctx.globalAlpha = 0.22 + event.intensity * 0.2;
    ctx.strokeStyle = profile.secondaryAccent;
    ctx.lineWidth = 3;
    for (let rope = 0; rope < 3; rope += 1) {
      const y = 52 + rope * 25;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        260,
        y + Math.sin(frame * 0.05 + rope) * 16,
        680,
        y - 12,
        CANVAS_WIDTH,
        y + 6
      );
      ctx.stroke();
    }
  } else {
    ctx.globalAlpha = event.intensity * 0.16;
    ctx.fillStyle = profile.secondaryAccent;
    for (let x = 0; x < CANVAS_WIDTH; x += 48) {
      const height = 4 + Math.sin(frame * 0.12 + x) * 3;
      ctx.fillRect(x, CANVAS_HEIGHT - 30 - height, 26, height);
    }
  }
  ctx.restore();
}

export interface FightPresentationOptions {
  theme?: FightArenaThemeId;
  encounterIndex?: number;
}

function renderForegroundCrowd(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame: number,
  profile: FightGraphicsProfile,
  reaction: FightStageReactionState
): void {
  ctx.save();
  ctx.fillStyle = '#05030A';
  for (let index = 0; index < 18; index += 1) {
    const worldX = index * 82 + profile.seed * 0.17;
    const x = calculateWrappedParallaxX(worldX, camera.x, 0.58, 1480, 90);
    const bob =
      Math.sin(frame * (0.045 + reaction.crowdEnergy * 0.035) + index * 1.7) *
      (2 + reaction.crowdEnergy * 5);
    const height = 24 + (index % 5) * 4;
    const y = CANVAS_HEIGHT - height + bob;
    ctx.globalAlpha = 0.42 + (index % 3) * 0.06;
    ctx.beginPath();
    ctx.arc(x + 11, y - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x, y - 4, 22, height);
    if (index % 4 === 0 || (reaction.crowdEnergy > 0.62 && index % 3 === 0)) {
      ctx.strokeStyle = `${profile.accent}55`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 11, y + 4);
      ctx.lineTo(
        x + 8 + Math.sin(frame * 0.08 + index) * (13 + reaction.crowdEnergy * 8),
        y - 19 - reaction.crowdEnergy * 15
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderFightForeground(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  frame: number,
  profile: FightGraphicsProfile,
  fightState: FightState | null = null
): void {
  const stageEvent = resolveFightStageEvent(frame, profile);
  const reaction = resolveFightStageReaction(fightState, stageEvent);
  renderForegroundCrowd(ctx, camera, frame, profile, reaction);

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
          const flutter = Math.sin(frame * 0.08 + strip + side) * reaction.crowdEnergy * 5;
          ctx.lineTo(x + strip * 38 + 20, CANVAS_HEIGHT - 137 + flutter);
          ctx.lineTo(x + strip * 38 + 6, CANVAS_HEIGHT - 137 - flutter * 0.5);
          ctx.fill();
        }
        ctx.fillStyle = `${profile.accent}44`;
        ctx.fillRect(x + 26, CANVAS_HEIGHT - 108, 130, 7);
      }
      break;
    }
    case 'archive_columns': {
      ctx.fillStyle = '#080610';
      ctx.globalAlpha = Math.min(1, 0.82 + reaction.lightPulse * 0.18);
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
        const flameHeight = 26 + Math.sin(frame * 0.18 + x) * 7 + reaction.lightPulse * 18;
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
  renderStageEventForeground(ctx, frame, profile, stageEvent);
  ctx.restore();
}

export function renderFightStageCue(
  ctx: CanvasRenderingContext2D,
  frame: number,
  profile: FightGraphicsProfile,
  fightState: FightState | null = null
): void {
  const event = resolveFightStageEvent(frame, profile);
  if (event.phase === 'idle') return;
  const reaction = resolveFightStageReaction(fightState, event);
  const width = 230;
  const height = 25;
  const x = CANVAS_WIDTH / 2 - width / 2;
  const y = 89;
  const phaseLabel = event.phase === 'warning' ? 'INCOMING' : event.phase.toUpperCase();

  ctx.save();
  ctx.globalAlpha = 0.72 + reaction.lightPulse * 0.24;
  ctx.fillStyle = 'rgba(7, 4, 14, 0.88)';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = event.phase === 'warning' ? profile.secondaryAccent : profile.accent;
  ctx.lineWidth = 1.5 + reaction.impactPulse * 1.5;
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = event.phase === 'warning' ? profile.secondaryAccent : profile.accent;
  ctx.fillRect(x, y + height - 3, width * event.phaseProgress, 3);
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(event.label, x + 8, y + 16);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F5EFFF';
  ctx.fillText(phaseLabel, x + width - 8, y + 16);
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
  stageEventId: FightStageEventId;
  stageEventLabel: string;
  stageEventPeriod: number;
  stageEventWarningFrames: number;
  stageEventActiveFrames: number;
  stageEventReleaseFrames: number;
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
  stageEventId: 'signal_surge',
  stageEventLabel: 'SIGNAL SURGE',
  stageEventPeriod: 360,
  stageEventWarningFrames: 54,
  stageEventActiveFrames: 92,
  stageEventReleaseFrames: 48,
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
    stageEventId: 'market_caravan',
    stageEventLabel: 'BRONZE CARAVAN',
    stageEventPeriod: 390,
    stageEventWarningFrames: 60,
    stageEventActiveFrames: 116,
    stageEventReleaseFrames: 54,
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
    stageEventId: 'archive_scan',
    stageEventLabel: 'ARCHIVE INDEX SWEEP',
    stageEventPeriod: 330,
    stageEventWarningFrames: 48,
    stageEventActiveFrames: 98,
    stageEventReleaseFrames: 42,
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
    stageEventId: 'gate_heat_wave',
    stageEventLabel: 'BRAZIER VERDICT',
    stageEventPeriod: 300,
    stageEventWarningFrames: 44,
    stageEventActiveFrames: 104,
    stageEventReleaseFrames: 52,
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

  const stageEvent = resolveFightStageEvent(frame, profile);
  renderStageEventBackdrop(ctx, camera, frame, profile, stageEvent);

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
