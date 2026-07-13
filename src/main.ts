/**
 * Ethic Brawl - Main Entry Point
 */

import { bootstrap, createFightRuntime, createGameLoop, hideLoading } from '@/app';
import { captureKeybindingEdit } from '@/app/app-shell/scene-factory';
import { loadAppSettings, saveAppSettings } from '@/app/settings-persistence';
import { getCharacterIds } from '@/content/characters/character-data';
import { installE2EProbe, updateE2EStatus } from '@/app/e2e-probe';
import type { E2EProbeSnapshot } from '@/app/e2e-probe';
import { createInputManager, createSceneManager } from '@/core';
import {
  getCharacterAnimationMap,
  getGridSpacing,
  getSpriteLoadReport,
  getSpriteScaleFactor,
  initializeAllCharacterSprites,
  setChromaKey,
  setDebugFrameBoundaries,
  setGridSpacing,
  setSpriteRendering,
  setSpriteScaleFactor,
  validateAllCharacterSprites,
} from '@/render/sprites';
import {
  renderDebugInfo,
  renderHelpOverlay,
  renderInputPanels,
} from '@/ui/screens/app-shell-renderers';
import { buildAppScenes, createInitialAppShellState } from './app/app-shell/scene-factory';

async function main() {
  console.info('🎮 Ethic Brawl - Initializing...');

  const { canvas } = await bootstrap();
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  console.info('📦 Loading sprite assets...');
  await initializeAllCharacterSprites();

  // Debug: Log sprite status after initialization
  console.info('🔍 Debug: Checking sprite status...');
  const characterIds = getCharacterIds();
  for (const id of characterIds) {
    const animMap = getCharacterAnimationMap(id);
    if (animMap?.atlas) {
      console.info(
        `  ${id}: atlas exists, image=${animMap.atlas.image.width}x${animMap.atlas.image.height}, frames=${animMap.atlas.frames.length}`
      );
    } else {
      console.warn(`  ${id}: no atlas (using procedural fallback)`);
    }
  }

  console.info('✓ Sprite assets loaded');

  const inputManager = createInputManager();
  const keyboard = inputManager.getKeyboard();
  const fightRuntime = createFightRuntime();
  const appState = createInitialAppShellState();
  appState.settings = loadAppSettings(appState.settings);
  inputManager.setBindings(appState.settings.bindings);

  let latestInput = inputManager.getState();
  let spriteRenderingEnabled = true; // Track local state for toggle
  let helpOpen = false;

  let sceneManagerRef: ReturnType<typeof createSceneManager> | null = null;

  const sceneManager = createSceneManager({
    scenes: buildAppScenes(
      {
        fightRuntime,
        getLatestInput: () => latestInput,
        transitionTo: (target) => sceneManagerRef?.transitionTo(target) ?? Promise.resolve(false),
        onSettingsChanged: (settings) => {
          inputManager.setBindings(settings.bindings);
          saveAppSettings(settings);
        },
      },
      appState
    ),
    initialScene: 'loading',
  });
  sceneManagerRef = sceneManager;

  sceneManager.init(ctx);
  await sceneManager.start();

  const gameLoop = createGameLoop(
    (deltaTime) => {
      inputManager.update();
      latestInput = inputManager.getState();

      if (sceneManager.getCurrentScene() === 'settings' && appState.settings.keybindingEdit) {
        const keyCode = keyboard.consumeLatestPressedKey([
          'Enter',
          'Space',
          'Backspace',
          'Escape',
          'ShiftLeft',
          'ShiftRight',
        ]);
        if (keyCode && captureKeybindingEdit(appState.settings, keyCode)) {
          inputManager.setBindings(appState.settings.bindings);
          saveAppSettings(appState.settings);
        }
      }

      if (
        keyboard.wasJustPressed('Slash') &&
        (keyboard.isPressed('ShiftLeft') || keyboard.isPressed('ShiftRight'))
      ) {
        helpOpen = !helpOpen;
      }

      if (keyboard.wasJustPressed('F1')) {
        spriteRenderingEnabled = !spriteRenderingEnabled;
        setSpriteRendering(spriteRenderingEnabled);
        console.info(
          `🎨 Sprite rendering ${spriteRenderingEnabled ? 'enabled' : 'disabled'} (press F1 to toggle)`
        );
      }

      if (keyboard.wasJustPressed('F2')) {
        console.info('🔍 Sprite validation:', validateAllCharacterSprites());
      }

      if (keyboard.wasJustPressed('F3')) {
        const newScale = Math.max(0.05, getSpriteScaleFactor() - 0.01);
        setSpriteScaleFactor(newScale);
        console.info(`🔍 Sprite scale factor: ${newScale.toFixed(2)}`);
      }

      if (keyboard.wasJustPressed('F4')) {
        const newScale = Math.min(1.0, getSpriteScaleFactor() + 0.01);
        setSpriteScaleFactor(newScale);
        console.info(`🔍 Sprite scale factor: ${newScale.toFixed(2)}`);
      }

      if (keyboard.wasJustPressed('F11')) {
        const newSpacing = Math.max(0, getGridSpacing() - 1);
        setGridSpacing(newSpacing);
        console.info(`🔍 Grid spacing: ${newSpacing}px - reload page to see effect`);
      }

      if (keyboard.wasJustPressed('F12')) {
        const newSpacing = Math.min(10, getGridSpacing() + 1);
        setGridSpacing(newSpacing);
        console.info(`🔍 Grid spacing: ${newSpacing}px - reload page to see effect`);
      }

      if (keyboard.wasJustPressed('F7')) {
        // Toggle chroma key to remove white backgrounds
        setChromaKey(true, 255, 255, 255, 50); // Remove white with threshold 50
        console.info(
          '🎨 Chroma key enabled - removing white backgrounds (F8 to disable, enabled by default)'
        );
      }

      if (keyboard.wasJustPressed('F8')) {
        setChromaKey(false);
        console.info('🎨 Chroma key disabled (F7 to enable, was enabled by default)');
      }

      if (keyboard.wasJustPressed('F9')) {
        setDebugFrameBoundaries(true);
        console.info('🔍 Frame boundaries debug enabled (F10 to disable)');
      }

      if (keyboard.wasJustPressed('F10')) {
        setDebugFrameBoundaries(false);
        console.info('🔍 Frame boundaries debug disabled (F9 to enable)');
      }

      if (!helpOpen) {
        sceneManager.update(deltaTime);
      }
    },
    () => {
      sceneManager.render();
      if (sceneManager.getCurrentScene() === 'fight') {
        renderInputPanels(ctx, latestInput.player1, latestInput.player2);
      }
      if (helpOpen) {
        renderHelpOverlay(ctx);
      }
      renderDebugInfo(ctx, gameLoop.getFPS(), gameLoop.getFrameCount());
      updateE2EStatus(getE2ESnapshot());
    }
  );

  const getE2ESnapshot = (): E2EProbeSnapshot => {
    const spriteReport = getSpriteLoadReport();
    const fightState = fightRuntime.getState();
    return {
      ready: sceneManager.getCurrentScene() !== 'loading',
      currentScene: sceneManager.getCurrentScene(),
      helpOpen,
      frameCount: gameLoop.getFrameCount(),
      fps: gameLoop.getFPS(),
      canvas: {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      },
      app: {
        startMenuIndex: appState.startMenuIndex,
        characterSelectPhase: appState.characterSelectPhase,
        player1SelectIndex: appState.player1SelectIndex,
        player2SelectIndex: appState.player2SelectIndex,
        stageNumber: appState.stageNumber,
        stageEncounterIndex: appState.stageEncounterIndex,
        stageEncounterWins: appState.stageEncounterWins,
        gameMode: appState.gameMode,
        skipStageIntro: appState.settings.skipStageIntro,
        settingsTab: appState.settings.menuTab,
        settingsSelectedIndex: appState.settings.selectedIndex,
        editingKeybinding: appState.settings.keybindingEdit,
        player1AttackBinding: appState.settings.bindings.player1.keys.get('attack') ?? [],
        fightResolvedThisMatch: appState.fightResolvedThisMatch,
        hasLatestResult: appState.latestResult !== null,
        pendingSelection: appState.pendingSelection,
      },
      sprites: {
        renderingEnabled: spriteRenderingEnabled,
        requestedCharacters: spriteReport.requested,
        loadedCharacters: spriteReport.loaded.length,
        failedCharacters: spriteReport.failed.map(({ characterId }) => characterId),
      },
      fight: {
        player1Character: fightState?.player1.characterId ?? null,
        player2Character: fightState?.player2.characterId ?? null,
        player1Health: fightState?.player1.health ?? null,
        player2Health: fightState?.player2.health ?? null,
        round: fightState?.round.number ?? null,
        hasResult: fightState?.result !== null,
      },
    };
  };

  installE2EProbe({
    getSnapshot: getE2ESnapshot,
    transitionTo: (scene) => sceneManager.transitionTo(scene),
    resolveCurrentMatch: (winner) => fightRuntime.resolveMatchForTesting(winner),
  });

  hideLoading();
  setTimeout(() => {
    void sceneManager.transitionTo('start');
  }, 500);

  gameLoop.start();
  console.info('🎮 Ethic Brawl - Ready!');
}

main().catch((error) => {
  console.error('Failed to start game:', error);
  const loading = document.getElementById('loading');
  if (loading) {
    loading.textContent = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    loading.classList.remove('hidden');
  }
});
