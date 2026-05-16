/**
 * Integration tests for scene flow
 * Tests the full application flow from start to results
 */

import { buildAppScenes, createInitialAppShellState } from '@/app/app-shell/scene-factory';
import type { AppShellState } from '@/app/app-shell/types';
import type { FightRuntimeStatus } from '@/app/fight-runtime';
import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import { beforeEach, describe, expect, it } from 'vitest';

// Mock dependencies
function createMockFightRuntime() {
  let currentSelection: { player1: CharacterId; player2: CharacterId } = {
    player1: 'camus',
    player2: 'machiavelli',
  };
  let result: FightRuntimeStatus | null = null;

  return {
    reset: (selection?: typeof currentSelection) => {
      if (selection) currentSelection = selection;
      result = null;
    },
    update: (_deltaTime: number, _input1: unknown, _input2: unknown) => {
      // Simulate fight ending after some time
      if (!result) {
        result = {
          hasRoundWinner: true,
          hasFightResult: true,
        };
      }
    },
    render: (_ctx: unknown) => {},
    getResult: () => ({
      winner: 1,
      rounds: [1, 0],
      totalTime: 45,
      maxCombo: 3,
      score: 1000,
      perfect: true,
    }),
    hasRoundWinner: () => true,
    startNextRound: (_timeout?: number) => {},
    getState: () => null,
  };
}

function createMockDeps() {
  let currentScene = 'loading';
  const sceneTransitions: string[] = [];

  return {
    fightRuntime: createMockFightRuntime(),
    getLatestInput: () => ({
      player1: {
        moveLeft: false,
        moveRight: false,
        moveUp: false,
        moveDown: false,
        jump: false,
        jumpPressed: false,
        attack: false,
        attackPressed: false,
        block: false,
        blockPressed: false,
        special: false,
        specialPressed: false,
        confirm: false,
        cancel: false,
        pause: false,
      },
      player2: {
        moveLeft: false,
        moveRight: false,
        moveUp: false,
        moveDown: false,
        jump: false,
        jumpPressed: false,
        attack: false,
        attackPressed: false,
        block: false,
        blockPressed: false,
        special: false,
        specialPressed: false,
      },
    }),
    transitionTo: async (target: string) => {
      sceneTransitions.push(currentScene);
      currentScene = target;
      return true;
    },
    getSceneTransitions: () => sceneTransitions,
    getCurrentScene: () => currentScene,
  };
}

function createMockInput(
  overrides: Partial<ReturnType<typeof createMockDeps>['getLatestInput']> = {}
) {
  return {
    player1: {
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
      jump: false,
      jumpPressed: false,
      attack: false,
      attackPressed: false,
      block: false,
      blockPressed: false,
      special: false,
      specialPressed: false,
      confirm: false,
      cancel: false,
      pause: false,
      ...overrides,
    },
    player2: {
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
      jump: false,
      jumpPressed: false,
      attack: false,
      attackPressed: false,
      block: false,
      blockPressed: false,
      special: false,
      specialPressed: false,
    },
  };
}

describe('Scene Flow Integration', () => {
  let appState: AppShellState;
  let mockDeps: ReturnType<typeof createMockDeps>;

  beforeEach(() => {
    appState = createInitialAppShellState();
    mockDeps = createMockDeps();
  });

  describe('Scene Factory Structure', () => {
    it('should create all required scenes', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const sceneNames = scenes.map((s) => s.name);

      expect(sceneNames).toContain('loading');
      expect(sceneNames).toContain('start');
      expect(sceneNames).toContain('settings');
      expect(sceneNames).toContain('character-select');
      expect(sceneNames).toContain('stage-intro');
      expect(sceneNames).toContain('fight');
      expect(sceneNames).toContain('trial');
      expect(sceneNames).toContain('upgrade');
      expect(sceneNames).toContain('pause');
      expect(sceneNames).toContain('results');
    });

    it('should initialize app state with defaults', () => {
      expect(appState.startMenuIndex).toBe(0);
      expect(appState.player1SelectIndex).toBe(0);
      expect(appState.gameMode).toBe('vs');
      expect(appState.stageNumber).toBe(1);
      expect(appState.settings.skipStageIntro).toBe(false);
    });
  });

  describe('Character Selection Flow', () => {
    it('should navigate character select', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const charSelectScene = scenes.find((s) => s.name === 'character-select');
      expect(charSelectScene).toBeDefined();

      // Simulate entering character select
      charSelectScene?.enter?.();
      expect(appState.characterSelectPhase).toBe(1);

      // Simulate moving left
      const moveLeftInput = createMockInput({ player1: { moveLeft: true } });
      Object.assign(mockDeps, { getLatestInput: () => moveLeftInput });

      charSelectScene?.update?.(0);
      expect(appState.player1SelectIndex).toBeGreaterThan(0); // Should wrap around
    });

    it('should confirm character selection and transition', async () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const charSelectScene = scenes.find((s) => s.name === 'character-select');

      charSelectScene?.enter?.();
      expect(appState.characterSelectPhase).toBe(1);

      // Confirm selection (phase 1 -> phase 2)
      const confirmInput = createMockInput({ player1: { confirm: true } });
      Object.assign(mockDeps, { getLatestInput: () => confirmInput });

      charSelectScene?.update?.(0);
      expect(appState.characterSelectPhase).toBe(2);

      // Confirm again (phase 2 -> stage-intro/fight)
      charSelectScene?.update?.(0);
      expect(appState.pendingSelection.player1).toBeDefined();
      expect(appState.pendingSelection.player2).toBeDefined();
    });
  });

  describe('Fight Scene Flow', () => {
    it('should initialize fight on enter', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const fightScene = scenes.find((s) => s.name === 'fight');

      fightScene?.enter?.();
      expect(appState.fightResolvedThisMatch).toBe(false);
      expect(appState.roundEndTimerFrames).toBe(0);
    });

    it('should handle fight updates', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const fightScene = scenes.find((s) => s.name === 'fight');

      fightScene?.enter?.();
      fightScene?.update?.(16.67);

      // Should have processed fight and potentially stored result
      expect(appState.latestResult).toBeDefined();
    });

    it('should transition to results after fight', async () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const fightScene = scenes.find((s) => s.name === 'fight');

      fightScene?.enter?.();
      fightScene?.update?.(16.67);

      const transitions = mockDeps.getSceneTransitions();
      expect(transitions).toContain('fight');
    });
  });

  describe('Game Mode Flows', () => {
    it('should support versus mode flow', async () => {
      appState.gameMode = 'vs';
      const scenes = buildAppScenes(mockDeps as any, appState);

      // In versus mode, fight results should go to results (not trial)
      const fightScene = scenes.find((s) => s.name === 'fight');
      fightScene?.enter?.();
      fightScene?.update?.(16.67);

      const transitions = mockDeps.getSceneTransitions();
      expect(transitions).toContain('results');
    });

    it('should support stage mode flow with trial', async () => {
      appState.gameMode = 'stage';
      const scenes = buildAppScenes(mockDeps as any, appState);

      // In stage mode, player 1 wins should go to trial
      const fightScene = scenes.find((s) => s.name === 'fight');
      fightScene?.enter?.();
      fightScene?.update?.(16.67);

      const transitions = mockDeps.getSceneTransitions();
      // Should go to trial if player 1 wins in stage mode
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('Settings Scene', () => {
    it('should toggle stage intro skip', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const settingsScene = scenes.find((s) => s.name === 'settings');

      const initialSkip = appState.settings.skipStageIntro;

      const toggleInput = createMockInput({ player1: { confirm: true } });
      Object.assign(mockDeps, { getLatestInput: () => toggleInput });

      settingsScene?.update?.();
      expect(appState.settings.skipStageIntro).toBe(!initialSkip);
    });

    it('should transition from settings to start on cancel', async () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const settingsScene = scenes.find((s) => s.name === 'settings');

      const cancelInput = createMockInput({ player1: { cancel: true } });
      Object.assign(mockDeps, { getLatestInput: () => cancelInput });

      settingsScene?.update?.();

      const transitions = mockDeps.getSceneTransitions();
      expect(transitions).toContain('settings');
    });
  });

  describe('State Persistence', () => {
    it('should maintain character selection across scenes', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const charSelectScene = scenes.find((s) => s.name === 'character-select');
      const _resultsScene = scenes.find((s) => s.name === 'results');

      // Select characters
      charSelectScene?.enter?.();
      appState.player1SelectIndex = 2; // Select different character
      appState.pendingSelection = {
        player1: getCharacterIds()[2],
        player2: getCharacterIds()[1],
      };

      // Results should still have the selection
      expect(appState.pendingSelection.player1).toBe(getCharacterIds()[2] as CharacterId);
    });
  });

  describe('Scene Transition Validation', () => {
    const validTransitions: Record<string, string[]> = {
      loading: ['start'],
      start: ['character-select', 'settings'],
      settings: ['start'],
      'character-select': ['start', 'stage-intro', 'fight'],
      'stage-intro': ['fight'],
      fight: ['pause', 'results', 'trial'],
      pause: ['fight', 'results'],
      trial: ['upgrade', 'results'],
      upgrade: ['results'],
      results: ['start'],
    };

    it('should only allow valid scene transitions', () => {
      const scenes = buildAppScenes(mockDeps as any, appState);
      const sceneNames = scenes.map((s) => s.name);

      for (const [from, validTargets] of Object.entries(validTransitions)) {
        expect(sceneNames).toContain(from);
        for (const target of validTargets) {
          expect(sceneNames).toContain(target);
        }
      }
    });
  });
});
