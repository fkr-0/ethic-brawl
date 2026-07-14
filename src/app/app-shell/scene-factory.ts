import type { FightRuntime } from '@/app/fight-runtime';
import {
  type CharacterId,
  getCharacter,
  getCharacterIds,
} from '@/content/characters/character-data';
import {
  STAGE_ONE,
  STAGE_ONE_ENCOUNTERS,
  getStageOneEncounter,
  isFinalStageOneEncounter,
} from '@/content/stages/stage-one-vertical-slice';
import { type Scene, type SceneName, createScene } from '@/core';
import {
  GAME_ACTIONS,
  type GameAction,
  resetBindingForPlayer,
  updateBindingForAction,
} from '@/core/input/input-binding';
import type { InputState } from '@/core/input/input-manager';
import {
  renderCharacterSelect,
  renderLoading,
  renderMainMenu,
  renderPauseScreen,
  renderResults,
  renderSettings,
  renderStageIntro,
  renderStageProgress,
  renderTrial,
  renderUpgrade,
} from '@/ui/screens/app-shell-renderers';
import type { FightOutcomeSummary, GameMode, MatchSelection, SettingsState } from './types';

/**
 * Scene update handlers - extracted for better organization
 */
interface SceneUpdateContext {
  appState: AppShellState;
  input: InputState;
  transitionTo: (target: SceneName) => Promise<boolean>;
  fightRuntime: FightRuntime;
  onSettingsChanged?: (settings: SettingsState) => void;
}

/**
 * Update start menu scene
 */
function updateStartScene(ctx: SceneUpdateContext): void {
  const { appState, input, transitionTo } = ctx;

  if (input.player1.moveUp && !appState.menuUpLatch) {
    appState.startMenuIndex = (appState.startMenuIndex + 2) % 3;
    appState.menuUpLatch = true;
  }
  if (!input.player1.moveUp) {
    appState.menuUpLatch = false;
  }

  if (input.player1.moveDown && !appState.menuDownLatch) {
    appState.startMenuIndex = (appState.startMenuIndex + 1) % 3;
    appState.menuDownLatch = true;
  }
  if (!input.player1.moveDown) {
    appState.menuDownLatch = false;
  }

  if (input.player1.confirm || input.player1.attack) {
    if (appState.startMenuIndex === 0) {
      appState.gameMode = 'vs';
      void transitionTo('character-select');
    } else if (appState.startMenuIndex === 1) {
      appState.gameMode = 'stage';
      void transitionTo('character-select');
    } else {
      void transitionTo('settings');
    }
  }
}

/**
 * Update settings scene
 */
const SETTINGS_GAMEPLAY_ROWS = 2;

function commitSettingsChange(ctx: SceneUpdateContext): void {
  ctx.onSettingsChanged?.(ctx.appState.settings);
}

export function captureKeybindingEdit(
  settings: SettingsState,
  keyCode: string,
  options: { replace?: boolean; removeConflicts?: boolean } = {
    replace: true,
    removeConflicts: true,
  }
): boolean {
  if (!settings.keybindingEdit) return false;
  const { playerId, action } = settings.keybindingEdit;
  const source = playerId === 1 ? settings.bindings.player1 : settings.bindings.player2;
  const updated = updateBindingForAction(source, action, keyCode, options);
  settings.bindings = {
    ...settings.bindings,
    [playerId === 1 ? 'player1' : 'player2']: updated,
  };
  settings.keybindingEdit = null;
  return true;
}

/**
 * Update settings scene
 */
function updateSettingsScene(ctx: SceneUpdateContext): void {
  const { appState, input, transitionTo } = ctx;
  const rowCount =
    appState.settings.menuTab === 'gameplay' ? SETTINGS_GAMEPLAY_ROWS : GAME_ACTIONS.length + 1;

  if (appState.settings.keybindingEdit) {
    if (input.player1.cancel || input.player1.pause) {
      appState.settings.keybindingEdit = null;
      commitSettingsChange(ctx);
    }
    return;
  }

  if (input.player1.moveUp && !appState.menuUpLatch) {
    appState.settings.selectedIndex = (appState.settings.selectedIndex - 1 + rowCount) % rowCount;
    appState.menuUpLatch = true;
  }
  if (!input.player1.moveUp) {
    appState.menuUpLatch = false;
  }

  if (input.player1.moveDown && !appState.menuDownLatch) {
    appState.settings.selectedIndex = (appState.settings.selectedIndex + 1) % rowCount;
    appState.menuDownLatch = true;
  }
  if (!input.player1.moveDown) {
    appState.menuDownLatch = false;
  }

  if ((input.player1.moveLeft || input.player1.moveRight) && !appState.settingsTabLatch) {
    appState.settings.menuTab =
      appState.settings.menuTab === 'gameplay' ? 'keybindings' : 'gameplay';
    appState.settings.selectedIndex = 0;
    appState.settingsTabLatch = true;
    commitSettingsChange(ctx);
  }
  if (!input.player1.moveLeft && !input.player1.moveRight) {
    appState.settingsTabLatch = false;
  }

  if (input.player1.confirm || input.player1.attack) {
    if (appState.settings.menuTab === 'gameplay') {
      if (appState.settings.selectedIndex === 0) {
        appState.settings.skipStageIntro = !appState.settings.skipStageIntro;
      } else {
        appState.settings.menuTab = 'keybindings';
        appState.settings.selectedIndex = 0;
      }
      commitSettingsChange(ctx);
      return;
    }

    if (appState.settings.selectedIndex === GAME_ACTIONS.length) {
      appState.settings.bindings = {
        player1: resetBindingForPlayer(1),
        player2: resetBindingForPlayer(2),
      };
      commitSettingsChange(ctx);
      return;
    }

    const action = GAME_ACTIONS[appState.settings.selectedIndex] as GameAction | undefined;
    if (action) {
      appState.settings.keybindingEdit = { playerId: 1, action };
      commitSettingsChange(ctx);
    }
  }

  if (input.player1.cancel || input.player1.pause) {
    appState.settings.keybindingEdit = null;
    commitSettingsChange(ctx);
    void transitionTo('start');
  }
}

/**
 * Update character select scene
 */
function updateCharacterSelectScene(ctx: SceneUpdateContext, characterIds: CharacterId[]): void {
  const { appState, input, transitionTo } = ctx;
  const activeIndexKey =
    appState.characterSelectPhase === 1 ? 'player1SelectIndex' : 'player2SelectIndex';

  if (input.player1.moveLeft && !appState.charSelectLeftLatch) {
    if (appState.characterSelectPhase === 1) {
      appState.player1SelectIndex =
        (appState.player1SelectIndex - 1 + characterIds.length) % characterIds.length;
    } else {
      appState.player2SelectIndex =
        (appState.player2SelectIndex - 1 + characterIds.length) % characterIds.length;
    }
    appState.charSelectLeftLatch = true;
  }
  if (!input.player1.moveLeft) {
    appState.charSelectLeftLatch = false;
  }

  if (input.player1.moveRight && !appState.charSelectRightLatch) {
    if (appState.characterSelectPhase === 1) {
      appState.player1SelectIndex = (appState.player1SelectIndex + 1) % characterIds.length;
    } else {
      appState.player2SelectIndex = (appState.player2SelectIndex + 1) % characterIds.length;
    }
    appState.charSelectRightLatch = true;
  }
  if (!input.player1.moveRight) {
    appState.charSelectRightLatch = false;
  }

  if (input.player1.moveUp && !appState.charSelectUpLatch) {
    appState[activeIndexKey] = moveCharacterSelectGridIndex(
      appState[activeIndexKey],
      'up',
      characterIds.length
    );
    appState.charSelectUpLatch = true;
  }
  if (!input.player1.moveUp) {
    appState.charSelectUpLatch = false;
  }

  if (input.player1.moveDown && !appState.charSelectDownLatch) {
    appState[activeIndexKey] = moveCharacterSelectGridIndex(
      appState[activeIndexKey],
      'down',
      characterIds.length
    );
    appState.charSelectDownLatch = true;
  }
  if (!input.player1.moveDown) {
    appState.charSelectDownLatch = false;
  }

  if (input.player1.cancel) {
    if (appState.characterSelectPhase === 2) {
      appState.characterSelectPhase = 1;
    } else {
      void transitionTo('start');
    }
  }

  if (input.player1.confirm) {
    if (appState.characterSelectPhase === 1) {
      if (appState.gameMode === 'stage') {
        const selectedP1 = selectCharacterByIndex(appState.player1SelectIndex, 'camus');
        const encounter = getStageOneEncounter(0);
        appState.stageNumber = 1;
        appState.stageEncounterIndex = 0;
        appState.stageEncounterWins = 0;
        appState.pendingSelection = {
          player1: selectedP1,
          player2: encounter.enemyCharacterId,
        };
        void transitionTo(appState.settings.skipStageIntro ? 'fight' : 'stage-intro');
        return;
      }
      appState.characterSelectPhase = 2;
      return;
    }

    const selectedP1 = selectCharacterByIndex(appState.player1SelectIndex, 'camus');
    let selectedP2 = selectCharacterByIndex(appState.player2SelectIndex, 'machiavelli');
    if (selectedP2 === selectedP1) {
      selectedP2 =
        characterIds.find((id) => id !== selectedP1) ??
        (selectedP1 === 'camus' ? 'machiavelli' : 'camus');
    }

    appState.pendingSelection = { player1: selectedP1, player2: selectedP2 };
    appState.stageNumber = 1;
    void transitionTo('fight');
  }
}

/**
 * Update stage intro scene
 */
function updateStageIntroScene(ctx: SceneUpdateContext): void {
  const { appState, input, transitionTo } = ctx;

  appState.stageIntroTimerFrames = Math.max(0, appState.stageIntroTimerFrames - 1);
  if (input.player1.confirm || appState.stageIntroTimerFrames === 0) {
    void transitionTo('fight');
  }
}

/**
 * Update fight scene
 */
function updateFightScene(ctx: SceneUpdateContext, deltaTime: number): void {
  const { appState, input, transitionTo, fightRuntime } = ctx;

  if (input.player1.pause) {
    void transitionTo('pause');
  }
  if (input.player1.cancel) {
    void transitionTo('results');
  }

  fightRuntime.update(deltaTime, input.player1, input.player2, appState.gameMode === 'stage');

  const result = fightRuntime.getResult();
  if (result && !appState.fightResolvedThisMatch) {
    appState.latestResult = {
      winner: result.winner,
      rounds: result.rounds,
      totalTime: result.totalTime,
      maxCombo: result.maxCombo,
      score: result.score,
      perfect: result.perfect,
    };
    appState.fightResolvedThisMatch = true;

    if (appState.gameMode === 'stage' && result.winner === 1) {
      appState.stageEncounterWins++;
      if (isFinalStageOneEncounter(appState.stageEncounterIndex)) {
        void transitionTo('trial');
      } else {
        appState.stageEncounterIndex++;
        const nextEncounter = getStageOneEncounter(appState.stageEncounterIndex);
        appState.pendingSelection = {
          player1: appState.pendingSelection.player1,
          player2: nextEncounter.enemyCharacterId,
        };
        appState.latestResult = null;
        void transitionTo(appState.settings.skipStageIntro ? 'fight' : 'stage-intro');
      }
    } else {
      void transitionTo('results');
    }
    return;
  }

  if (fightRuntime.hasRoundWinner() && !result) {
    appState.roundEndTimerFrames++;
    if (appState.roundEndTimerFrames > 90) {
      fightRuntime.startNextRound();
      appState.roundEndTimerFrames = 0;
    }
  } else {
    appState.roundEndTimerFrames = 0;
  }
}

/**
 * Update trial scene
 */
function updateTrialScene(ctx: SceneUpdateContext): void {
  const { input, transitionTo } = ctx;

  if (input.player1.confirm) {
    void transitionTo('upgrade');
  }
  if (input.player1.cancel) {
    void transitionTo('results');
  }
}

/**
 * Update upgrade scene
 */
function updateUpgradeScene(ctx: SceneUpdateContext): void {
  const { appState, input, transitionTo } = ctx;

  if (input.player1.confirm) {
    appState.stageNumber++;
    void transitionTo('results');
  }
}

/**
 * Update pause scene
 */
function updatePauseScene(ctx: SceneUpdateContext): void {
  const { input, transitionTo } = ctx;

  if (input.player1.pause || input.player1.cancel) {
    void transitionTo('fight');
  }
}

/**
 * Update results scene
 */
function updateResultsScene(ctx: SceneUpdateContext): void {
  const { appState, input, transitionTo } = ctx;

  if (input.player1.confirm) {
    if (appState.gameMode === 'stage' && appState.latestResult?.winner === 2) {
      appState.latestResult = null;
      void transitionTo(appState.settings.skipStageIntro ? 'fight' : 'stage-intro');
      return;
    }
    void transitionTo('start');
  }

  if (
    input.player1.cancel &&
    appState.gameMode === 'stage' &&
    appState.latestResult?.winner === 2
  ) {
    void transitionTo('start');
  }
}

interface BuildScenesDeps {
  fightRuntime: FightRuntime;
  getLatestInput: () => InputState;
  transitionTo: (target: SceneName) => Promise<boolean>;
  getCharacterIdsList?: () => ReturnType<typeof getCharacterIds>;
  onSettingsChanged?: (settings: SettingsState) => void;
}

export interface AppShellState {
  player1SelectIndex: number;
  player2SelectIndex: number;
  characterSelectPhase: 1 | 2;
  charSelectLeftLatch: boolean;
  charSelectRightLatch: boolean;
  charSelectUpLatch: boolean;
  charSelectDownLatch: boolean;
  stageNumber: number;
  stageEncounterIndex: number;
  stageEncounterWins: number;
  stageIntroTimerFrames: number;
  roundEndTimerFrames: number;
  latestResult: FightOutcomeSummary | null;
  fightResolvedThisMatch: boolean;
  pendingSelection: MatchSelection;
  gameMode: GameMode;
  startMenuIndex: number;
  menuUpLatch: boolean;
  menuDownLatch: boolean;
  settingsTabLatch: boolean;
  settings: SettingsState;
}

function selectCharacterByIndex(index: number, fallback: MatchSelection['player1']) {
  return getCharacterIds()[index] ?? fallback;
}

export const CHARACTER_SELECT_COLUMNS = 6;

export function moveCharacterSelectGridIndex(
  index: number,
  direction: 'up' | 'down',
  itemCount: number,
  columns = CHARACTER_SELECT_COLUMNS
): number {
  if (itemCount <= 0) return 0;
  const delta = direction === 'up' ? -columns : columns;
  return (index + delta + itemCount) % itemCount;
}

export function createInitialAppShellState(): AppShellState {
  const characterIds = getCharacterIds();
  return {
    player1SelectIndex: 0,
    player2SelectIndex: Math.min(1, characterIds.length - 1),
    characterSelectPhase: 1,
    charSelectLeftLatch: false,
    charSelectRightLatch: false,
    charSelectUpLatch: false,
    charSelectDownLatch: false,
    stageNumber: 1,
    stageEncounterIndex: 0,
    stageEncounterWins: 0,
    stageIntroTimerFrames: 0,
    roundEndTimerFrames: 0,
    latestResult: null,
    fightResolvedThisMatch: false,
    pendingSelection: {
      player1: characterIds[0] ?? 'camus',
      player2: characterIds[Math.min(1, characterIds.length - 1)] ?? 'machiavelli',
    },
    gameMode: 'vs',
    startMenuIndex: 0,
    menuUpLatch: false,
    menuDownLatch: false,
    settingsTabLatch: false,
    settings: {
      skipStageIntro: false,
      menuTab: 'gameplay',
      selectedIndex: 0,
      keybindingEdit: null,
      bindings: {
        player1: resetBindingForPlayer(1),
        player2: resetBindingForPlayer(2),
      },
    },
  };
}

export function buildAppScenes(deps: BuildScenesDeps, appState: AppShellState): Scene[] {
  const characterIds = (deps.getCharacterIdsList ?? getCharacterIds)();

  // Create shared update context
  const createUpdateContext = (): SceneUpdateContext => ({
    appState,
    input: deps.getLatestInput(),
    transitionTo: deps.transitionTo,
    fightRuntime: deps.fightRuntime,
    ...(deps.onSettingsChanged && { onSettingsChanged: deps.onSettingsChanged }),
  });

  return [
    createScene('loading', {
      render: (ctx) => {
        renderLoading(ctx);
      },
    }),
    createScene('start', {
      enter: () => {
        appState.latestResult = null;
      },
      update: () => {
        updateStartScene(createUpdateContext());
      },
      render: (ctx) => {
        renderMainMenu(ctx, appState.startMenuIndex);
      },
    }),
    createScene('settings', {
      update: () => {
        updateSettingsScene(createUpdateContext());
      },
      render: (ctx) => {
        renderSettings(ctx, appState.settings);
      },
    }),
    createScene('character-select', {
      enter: () => {
        appState.characterSelectPhase = 1;
        appState.charSelectLeftLatch = false;
        appState.charSelectRightLatch = false;
        appState.charSelectUpLatch = false;
        appState.charSelectDownLatch = false;
      },
      update: () => {
        updateCharacterSelectScene(createUpdateContext(), characterIds);
      },
      render: (ctx) => {
        renderCharacterSelect(
          ctx,
          characterIds,
          appState.player1SelectIndex,
          appState.player2SelectIndex,
          appState.characterSelectPhase,
          appState.gameMode
        );
      },
    }),
    createScene('stage-intro', {
      enter: () => {
        appState.stageIntroTimerFrames = 75;
      },
      update: () => {
        updateStageIntroScene(createUpdateContext());
      },
      render: (ctx) => {
        const encounter = getStageOneEncounter(appState.stageEncounterIndex);
        renderStageIntro(ctx, {
          stageNumber: appState.stageNumber,
          stageName: STAGE_ONE.name,
          tagline: STAGE_ONE.tagline,
          wave: encounter.wave,
          waveCount: STAGE_ONE_ENCOUNTERS.length,
          encounterTitle: encounter.title,
          playerCharacterId: appState.pendingSelection.player1,
          playerName: getCharacter(appState.pendingSelection.player1).name,
          enemyCharacterId: encounter.enemyCharacterId,
          enemyName: getCharacter(encounter.enemyCharacterId).name,
          enemyArchetypes: encounter.enemyArchetypes,
          note: encounter.note,
          aiDifficulty: encounter.aiDifficulty,
          modeLabel: encounter.mode.label,
          modeDescription: encounter.mode.description,
          ruleSummary: encounter.mode.ruleSummary,
        });
      },
    }),
    createScene('fight', {
      enter: () => {
        appState.fightResolvedThisMatch = false;
        appState.roundEndTimerFrames = 0;
        const encounter = getStageOneEncounter(appState.stageEncounterIndex);
        deps.fightRuntime.reset(appState.pendingSelection, {
          player2AIDifficulty: appState.gameMode === 'stage' ? encounter.aiDifficulty : 'medium',
          ...(appState.gameMode === 'stage' ? { fightRules: encounter.mode.fightRules } : {}),
        });
      },
      update: (deltaTime) => {
        updateFightScene(createUpdateContext(), deltaTime);
      },
      render: (ctx) => {
        deps.fightRuntime.render(ctx, {
          theme: appState.gameMode === 'stage' ? 'babylon' : 'neon_arena',
          encounterIndex: appState.stageEncounterIndex,
        });
        if (appState.gameMode === 'stage') {
          const encounter = getStageOneEncounter(appState.stageEncounterIndex);
          renderStageProgress(ctx, {
            stageNumber: appState.stageNumber,
            stageName: STAGE_ONE.name,
            wave: encounter.wave,
            waveCount: STAGE_ONE_ENCOUNTERS.length,
            modeLabel: encounter.mode.label,
          });
        }
      },
    }),
    createScene('trial', {
      update: () => {
        updateTrialScene(createUpdateContext());
      },
      render: (ctx) => {
        renderTrial(ctx);
      },
    }),
    createScene('upgrade', {
      update: () => {
        updateUpgradeScene(createUpdateContext());
      },
      render: (ctx) => {
        renderUpgrade(ctx);
      },
    }),
    createScene('pause', {
      update: () => {
        updatePauseScene(createUpdateContext());
      },
      render: (ctx) => {
        renderPauseScreen(ctx);
      },
    }),
    createScene('results', {
      update: () => {
        updateResultsScene(createUpdateContext());
      },
      render: (ctx) => {
        const player1 = getCharacter(appState.pendingSelection.player1);
        const player2 = getCharacter(appState.pendingSelection.player2);
        renderResults(ctx, appState.latestResult, {
          gameMode: appState.gameMode,
          player1Name: player1.name,
          player2Name: player2.name,
          stageNumber: appState.stageNumber,
          stageEncounterIndex: appState.stageEncounterIndex,
          stageEncounterWins: appState.stageEncounterWins,
          stageEncounterCount: STAGE_ONE_ENCOUNTERS.length,
        });
      },
    }),
  ];
}
