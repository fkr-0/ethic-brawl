import type { SceneName } from '@/core';
import type { FighterAnimationSnapshot } from '@/render';
import type { SpriteValidationReport } from '@/render/sprites';
import type { AppShellState } from './app-shell/scene-factory';

export interface E2EProbeSnapshot {
  ready: boolean;
  currentScene: SceneName | null;
  helpOpen: boolean;
  frameCount: number;
  fps: number;
  canvas: {
    width: number;
    height: number;
    clientWidth: number;
    clientHeight: number;
  };
  app: Pick<
    AppShellState,
    | 'startMenuIndex'
    | 'characterSelectPhase'
    | 'player1SelectIndex'
    | 'player2SelectIndex'
    | 'stageNumber'
    | 'stageEncounterIndex'
    | 'stageEncounterWins'
    | 'gameMode'
  > & {
    skipStageIntro: boolean;
    settingsTab: AppShellState['settings']['menuTab'];
    settingsSelectedIndex: number;
    editingKeybinding: AppShellState['settings']['keybindingEdit'];
    player1AttackBinding: string[];
    fightResolvedThisMatch: boolean;
    hasLatestResult: boolean;
    pendingSelection: AppShellState['pendingSelection'];
  };
  sprites: {
    renderingEnabled: boolean;
    requestedCharacters: number;
    loadedCharacters: number;
    failedCharacters: string[];
  };
  renderer: {
    backend: 'canvas2d';
    pixiInstalled: false;
    rendererNeutralPresentation: true;
    theme: 'neon_arena' | 'babylon';
    profileId: string;
  };
  fight: {
    player1Character: string | null;
    player2Character: string | null;
    player1Health: number | null;
    player2Health: number | null;
    player1X: number | null;
    player2X: number | null;
    player1Lane: number | null;
    player2Lane: number | null;
    player1State: string | null;
    player2State: string | null;
    particleCapacity: number;
    activeParticles: number;
    emittedParticleBursts: number;
    recycledParticles: number;
    rulesId: string;
    roundTimeSeconds: number;
    player1Energy: number | null;
    player2Energy: number | null;
    player2MaxHealth: number | null;
    round: number | null;
    hasResult: boolean;
    player2AIDifficulty: 'easy' | 'medium' | 'hard';
    player1Animation: FighterAnimationSnapshot | null;
    player2Animation: FighterAnimationSnapshot | null;
  };
}

export interface E2EProbeApi {
  getSnapshot: () => E2EProbeSnapshot;
  transitionTo: (scene: SceneName) => Promise<boolean>;
  resolveCurrentMatch: (winner: 1 | 2) => void;
  getSpriteValidation: () => SpriteValidationReport;
}

declare global {
  interface Window {
    __ETHIC_BRAWL_E2E__?: E2EProbeApi;
  }
}

const STATUS_ELEMENT_ID = 'e2e-status';

function ensureStatusElement(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const existing = document.getElementById(STATUS_ELEMENT_ID);
  if (existing) {
    return existing;
  }

  const element = document.createElement('output');
  element.id = STATUS_ELEMENT_ID;
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-label', 'Ethic Brawl runtime status');
  element.hidden = true;
  document.body.appendChild(element);
  return element;
}

export function updateE2EStatus(snapshot: E2EProbeSnapshot): void {
  const element = ensureStatusElement();
  if (!element) {
    return;
  }

  element.dataset.ready = String(snapshot.ready);
  element.dataset.scene = snapshot.currentScene ?? 'none';
  element.dataset.helpOpen = String(snapshot.helpOpen);
  element.dataset.startMenuIndex = String(snapshot.app.startMenuIndex);
  element.dataset.characterSelectPhase = String(snapshot.app.characterSelectPhase);
  element.dataset.gameMode = snapshot.app.gameMode;
  element.dataset.skipStageIntro = String(snapshot.app.skipStageIntro);
  element.dataset.settingsTab = snapshot.app.settingsTab;
  element.dataset.settingsSelectedIndex = String(snapshot.app.settingsSelectedIndex);
  element.dataset.editingKeybinding = snapshot.app.editingKeybinding
    ? `${snapshot.app.editingKeybinding.playerId}:${snapshot.app.editingKeybinding.action}`
    : 'none';
  element.dataset.player1AttackBinding = snapshot.app.player1AttackBinding.join(',');
  element.dataset.stageNumber = String(snapshot.app.stageNumber);
  element.dataset.stageEncounterIndex = String(snapshot.app.stageEncounterIndex);
  element.dataset.stageEncounterWins = String(snapshot.app.stageEncounterWins);
  element.dataset.loadedCharacters = String(snapshot.sprites.loadedCharacters);
  element.dataset.failedCharacters = snapshot.sprites.failedCharacters.join(',');
  element.dataset.rendererBackend = snapshot.renderer.backend;
  element.dataset.graphicsTheme = snapshot.renderer.theme;
  element.dataset.graphicsProfile = snapshot.renderer.profileId;
  element.dataset.activeParticles = String(snapshot.fight.activeParticles);
  element.dataset.emittedParticleBursts = String(snapshot.fight.emittedParticleBursts);
  element.dataset.recycledParticles = String(snapshot.fight.recycledParticles);
  element.dataset.fightRules = snapshot.fight.rulesId;
  element.dataset.roundTimeSeconds = String(snapshot.fight.roundTimeSeconds);
  element.dataset.player1Health = String(snapshot.fight.player1Health ?? 'none');
  element.dataset.player2Health = String(snapshot.fight.player2Health ?? 'none');
  element.dataset.player1Clip = snapshot.fight.player1Animation?.clipId ?? 'none';
  element.dataset.player1AtlasFrame = String(
    snapshot.fight.player1Animation?.atlasFrameIndex ?? 'none'
  );
  element.dataset.frameCount = String(snapshot.frameCount);
  element.textContent = JSON.stringify(snapshot);
}

export function installE2EProbe(api: E2EProbeApi): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.__ETHIC_BRAWL_E2E__ = api;
  updateE2EStatus(api.getSnapshot());
}
