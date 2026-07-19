/** Renderer-neutral arcade-runtime transition manager adapted to Ethic Brawl scenes. */

import { createTransitionSceneManager } from '../../../vendor/arcade-runtime.mjs';

export type SceneName =
  | 'loading'
  | 'start'
  | 'character-select'
  | 'stage-intro'
  | 'fight'
  | 'trial'
  | 'upgrade'
  | 'results'
  | 'pause'
  | 'settings';

export interface Scene {
  name: SceneName;
  enter: (params?: Record<string, unknown>) => Promise<void>;
  update: (deltaTime: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  exit: () => Promise<void>;
}

export interface SceneManagerConfig {
  scenes: Scene[];
  initialScene: SceneName;
  clear?: (ctx: CanvasRenderingContext2D, scene: SceneName | null) => void;
}

const VALID_TRANSITIONS: Record<SceneName, SceneName[]> = {
  loading: ['start'],
  start: ['character-select', 'settings', 'loading'],
  'character-select': ['stage-intro', 'fight', 'start'],
  'stage-intro': ['fight'],
  fight: ['stage-intro', 'results', 'trial', 'pause'],
  trial: ['results', 'upgrade'],
  upgrade: ['stage-intro', 'results', 'start'],
  results: ['start', 'stage-intro', 'character-select'],
  pause: ['fight', 'start'],
  settings: ['start'],
};

export function createSceneManager(config: SceneManagerConfig) {
  return createTransitionSceneManager<SceneName, CanvasRenderingContext2D>({
    scenes: config.scenes,
    initialScene: config.initialScene,
    transitions: VALID_TRANSITIONS,
    clear:
      config.clear ??
      ((ctx) => {
        ctx.fillStyle = '#1A0A2E';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }),
  });
}

export function createScene(
  name: SceneName,
  handlers: {
    enter?: (params?: Record<string, unknown>) => Promise<void> | void;
    update?: (deltaTime: number) => void;
    render?: (ctx: CanvasRenderingContext2D) => void;
    exit?: () => Promise<void> | void;
  }
): Scene {
  return {
    name,
    enter: async (params) => handlers.enter?.(params),
    update: (deltaTime) => handlers.update?.(deltaTime),
    render: (ctx) => handlers.render?.(ctx),
    exit: async () => handlers.exit?.(),
  };
}
