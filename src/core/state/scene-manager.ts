/**
 * Scene management for game screens/states
 */

/**
 * Scene names
 */
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

/**
 * Scene interface
 */
export interface Scene {
  name: SceneName;
  enter: (params?: Record<string, unknown>) => Promise<void>;
  update: (deltaTime: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  exit: () => Promise<void>;
}

/**
 * Scene manager configuration
 */
export interface SceneManagerConfig {
  scenes: Scene[];
  initialScene: SceneName;
  clear?: (ctx: CanvasRenderingContext2D, scene: SceneName | null) => void;
}

/**
 * Valid scene transitions
 */
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

/**
 * Create a scene manager
 */
export function createSceneManager(config: SceneManagerConfig) {
  const sceneMap = new Map<SceneName, Scene>();
  let currentScene: Scene | null = null;
  let currentParams: Record<string, unknown> | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let isTransitioning = false;

  // Build scene map
  for (const scene of config.scenes) {
    sceneMap.set(scene.name, scene);
  }

  /**
   * Initialize with canvas context
   */
  function init(canvasCtx: CanvasRenderingContext2D): void {
    ctx = canvasCtx;
  }

  /**
   * Get the current scene name
   */
  function getCurrentScene(): SceneName | null {
    return currentScene?.name ?? null;
  }

  /**
   * Enter the configured initial scene exactly once
   */
  async function start(): Promise<boolean> {
    if (currentScene) {
      return true;
    }

    return transitionTo(config.initialScene);
  }

  /**
   * Check if transition is valid
   */
  function canTransitionTo(target: SceneName): boolean {
    if (!currentScene) return target === config.initialScene;
    return VALID_TRANSITIONS[currentScene.name]?.includes(target) ?? false;
  }

  /**
   * Transition to a new scene
   */
  async function transitionTo(
    target: SceneName,
    params?: Record<string, unknown>
  ): Promise<boolean> {
    if (isTransitioning) {
      console.warn('Scene transition already in progress');
      return false;
    }

    if (!canTransitionTo(target)) {
      console.error(`Invalid scene transition to "${target}"`);
      return false;
    }

    const targetScene = sceneMap.get(target);
    if (!targetScene) {
      console.error(`Scene "${target}" not found`);
      return false;
    }

    isTransitioning = true;

    // Exit current scene
    if (currentScene) {
      await currentScene.exit();
    }

    // Enter new scene
    currentScene = targetScene;
    currentParams = params;

    await targetScene.enter(params);

    isTransitioning = false;
    return true;
  }

  /**
   * Update the current scene
   */
  function update(deltaTime: number): void {
    if (currentScene && !isTransitioning) {
      currentScene.update(deltaTime);
    }
  }

  /**
   * Render the current scene
   */
  function render(): void {
    if (!ctx) return;

    // Clear canvas
    if (config.clear) {
      config.clear(ctx, currentScene?.name ?? null);
    } else {
      ctx.fillStyle = '#1A0A2E';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Render current scene
    if (currentScene) {
      currentScene.render(ctx);
    }
  }

  /**
   * Get scene parameters
   */
  function getParams(): Record<string, unknown> | undefined {
    return currentParams;
  }

  return {
    init,
    start,
    getCurrentScene,
    canTransitionTo,
    transitionTo,
    update,
    render,
    getParams,
  };
}

/**
 * Create a simple scene
 */
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
    enter: async (params) => {
      if (handlers.enter) {
        await handlers.enter(params);
      }
    },
    update: (deltaTime) => {
      if (handlers.update) {
        handlers.update(deltaTime);
      }
    },
    render: (ctx) => {
      if (handlers.render) {
        handlers.render(ctx);
      }
    },
    exit: async () => {
      if (handlers.exit) {
        await handlers.exit();
      }
    },
  };
}
