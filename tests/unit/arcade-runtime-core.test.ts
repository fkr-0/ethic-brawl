import { describe, expect, it, vi } from 'vitest';
import {
  createArcadeFrameProfiler,
  createArcadePixiRuntime,
  createCanvasTexturePass,
  defineArcadeRenderPlan,
} from '../../vendor/arcade-runtime.mjs';
import type {
  ArcadePixiNamespace,
  ArcadePixiRuntimeOptions,
} from '../../vendor/arcade-runtime.mjs';

class MockContainer {
  label = '';
  zIndex = 0;
  sortableChildren = false;
  visible = true;
  children: MockContainer[] = [];
  parent: MockContainer | null = null;
  position = { x: 0, y: 0, set: (x: number, y: number) => Object.assign(this.position, { x, y }) };
  pivot = { x: 0, y: 0, set: (x: number, y: number) => Object.assign(this.pivot, { x, y }) };
  scale = { x: 1, y: 1, set: (value: number) => Object.assign(this.scale, { x: value, y: value }) };

  addChild<T extends MockContainer>(child: T): T {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  removeChildren(): MockContainer[] {
    const children = [...this.children];
    this.children.length = 0;
    for (const child of children) child.parent = null;
    return children;
  }

  removeFromParent(): void {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    if (index >= 0) this.parent.children.splice(index, 1);
    this.parent = null;
  }

  destroy(): void {}
}

class MockTexture {
  static from = vi.fn(() => new MockTexture());
  source = { scaleMode: 'nearest', update: vi.fn() };
  update = vi.fn();
  destroy = vi.fn();
}

class MockSprite extends MockContainer {
  width = 0;
  height = 0;
  constructor(public texture: MockTexture) {
    super();
  }
}

class MockApplication {
  canvas = document.createElement('canvas');
  stage = new MockContainer();
  renderer = {
    type: 'webgl',
    render: vi.fn(),
    resize: vi.fn(),
  };
  init = vi.fn(async ({ width, height }: { width: number; height: number }) => {
    this.canvas.width = width;
    this.canvas.height = height;
  });
  destroy = vi.fn();
}

function createMockPixi(): ArcadePixiNamespace {
  return {
    Application: MockApplication,
    Container: MockContainer,
    Assets: {
      load: vi.fn(),
      get: vi.fn(),
    },
    TextureStyle: { defaultOptions: { scaleMode: 'nearest' } },
    Texture: MockTexture,
    Sprite: MockSprite,
  } as unknown as ArcadePixiNamespace;
}

async function createRuntime(overrides: Partial<ArcadePixiRuntimeOptions> = {}) {
  return createArcadePixiRuntime({
    PIXI: createMockPixi(),
    mount: document.body,
    logicalWidth: 960,
    logicalHeight: 540,
    autoRender: false,
    pauseWhenHidden: false,
    ...overrides,
  });
}

describe('arcade-runtime Pixi core', () => {
  it('executes systems and passes in deterministic priority/order/registration order', async () => {
    const runtime = await createRuntime();
    const calls: string[] = [];

    runtime.addSystem('system-low', () => calls.push('system-low'), { priority: 0 });
    runtime.addSystem('system-high', () => calls.push('system-high'), { priority: 10 });
    runtime.addPass('late', {
      layer: 'world',
      order: 20,
      update: () => calls.push('pass-late'),
    });
    runtime.addPass('early', {
      layer: 'world',
      order: 10,
      update: () => calls.push('pass-early'),
    });
    runtime.addPass('early-priority', {
      layer: 'world',
      order: 10,
      priority: 5,
      update: () => calls.push('pass-early-priority'),
    });

    runtime.step(16, 16, false);

    expect(calls).toEqual([
      'system-high',
      'system-low',
      'pass-early-priority',
      'pass-early',
      'pass-late',
    ]);
    expect(runtime.snapshot().passNames).toEqual(['early-priority', 'early', 'late']);
    runtime.destroy();
  });

  it('pauses on WebGL context loss, suppresses frames, and resumes the prior run state', async () => {
    const scheduled = new Map<number, FrameRequestCallback>();
    let nextHandle = 1;
    const runtime = await createRuntime({
      requestFrame: (callback) => {
        const handle = nextHandle++;
        scheduled.set(handle, callback);
        return handle;
      },
      cancelFrame: (handle) => {
        scheduled.delete(handle);
      },
    });

    runtime.start('test');
    expect(runtime.running).toBe(true);
    const beforeLoss = runtime.snapshot().ticks;
    const lost = new Event('webglcontextlost', { cancelable: true });
    runtime.canvas.dispatchEvent(lost);

    expect(lost.defaultPrevented).toBe(true);
    expect(runtime.running).toBe(false);
    expect(runtime.snapshot().contextState).toBe('lost');
    runtime.step(16, 32, true);
    expect(runtime.snapshot().ticks).toBe(beforeLoss);

    runtime.canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(runtime.snapshot().contextState).toBe('ready');
    expect(runtime.running).toBe(true);
    expect(runtime.snapshot().contextRestores).toBe(1);
    runtime.destroy();
  });

  it('profiles synchronous and asynchronous work with bounded samples', async () => {
    let now = 0;
    const profiler = createArcadeFrameProfiler({ sampleSize: 2, now: () => now });

    profiler.measure('sync', () => {
      now += 3;
    });
    await profiler.measureAsync('async', async () => {
      await Promise.resolve();
      now += 7;
    });
    profiler.record('sync', 5);
    profiler.record('sync', 9);

    expect(profiler.snapshot('sync')).toMatchObject({ count: 2, lastMs: 9, meanMs: 7 });
    expect(profiler.snapshot('async')).toMatchObject({ count: 1, lastMs: 7 });
  });

  it('supports invalidated Canvas texture passes without redundant redraws or resizes', async () => {
    const runtime = await createRuntime();
    const draw = vi.fn();
    const context = { clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
    const canvasFactory = () =>
      ({ width: 0, height: 0, getContext: () => context }) as unknown as HTMLCanvasElement;
    let animate = false;

    const pass = createCanvasTexturePass(runtime, {
      PIXI: createMockPixi(),
      name: 'cached-stage',
      layer: 'world',
      draw,
      shouldDraw: () => animate,
      canvasFactory,
    });

    runtime.step(16, 16, false);
    runtime.step(16, 32, false);
    expect(draw).toHaveBeenCalledOnce();
    expect(pass.state.redraws).toBe(1);
    expect(pass.state.skippedFrames).toBe(1);

    pass.state.invalidate();
    runtime.step(16, 48, false);
    animate = true;
    runtime.step(16, 64, false);
    expect(draw).toHaveBeenCalledTimes(3);

    animate = false;
    runtime.resize(960, 540);
    runtime.step(16, 80, false);
    expect(draw).toHaveBeenCalledTimes(3);
    runtime.resize(800, 450);
    runtime.step(16, 96, false);
    expect(draw).toHaveBeenCalledTimes(4);
    runtime.destroy();
  });

  it('rejects non-finite render-plan order and priority values', () => {
    expect(() =>
      defineArcadeRenderPlan([{ name: 'bad-order', layer: 'world', order: Number.NaN }])
    ).toThrow(/order must be finite/);
    expect(() =>
      defineArcadeRenderPlan([
        { name: 'bad-priority', layer: 'world', priority: Number.POSITIVE_INFINITY },
      ])
    ).toThrow(/priority must be finite/);
  });
});
