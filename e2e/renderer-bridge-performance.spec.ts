import { type Page, expect, test } from '@playwright/test';

type PerformanceSummary = {
  count: number;
  meanMs: number;
  p95Ms: number;
  maxMs: number;
};

async function enterFightAndMeasure(
  page: Page,
  mode: 'canvas' | 'bridge'
): Promise<PerformanceSummary> {
  await page.goto(`?renderer=${mode}`);
  await page.waitForFunction(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().ready === true);
  await page.waitForFunction(
    () => window.__ETHIC_BRAWL_E2E__?.getSnapshot().currentScene === 'start'
  );
  await page.evaluate(async () => {
    const api = window.__ETHIC_BRAWL_E2E__;
    if (!api) throw new Error('E2E probe unavailable');
    await api.transitionTo('character-select');
    await api.transitionTo('fight');
  });
  await page.waitForFunction(
    () => window.__ETHIC_BRAWL_E2E__?.getSnapshot().currentScene === 'fight'
  );
  await page.waitForFunction(
    () => (window.__ETHIC_BRAWL_E2E__?.getSnapshot().renderer.renderPerformance.count ?? 0) >= 90
  );
  const snapshot = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot());
  if (!snapshot) throw new Error('Missing renderer snapshot');
  expect(snapshot.renderer.bridgeEnabled).toBe(mode === 'bridge');
  expect(snapshot.renderer.bridgeRequested).toBe(mode === 'bridge');
  expect(snapshot.renderer.backend).toBe(mode === 'bridge' ? 'pixi-canvas-bridge' : 'canvas2d');
  if (mode === 'bridge') {
    expect(snapshot.renderer.bridgeFailureReason).toBeNull();
    expect(snapshot.renderer.bridgeContextState).toBe('ready');
    expect(snapshot.renderer.bridgePasses).toEqual(['stage-canvas']);
    await expect(page.locator('#ethic-pixi-bridge')).toBeVisible();
    await expect(page.locator('#ethic-pixi-bridge')).toHaveAttribute(
      'data-arcade-passes',
      'stage-canvas'
    );
  }
  return snapshot.renderer.renderPerformance;
}

test('compares Canvas-only and opt-in bridge frame performance before defaulting', async ({
  page,
}) => {
  const canvas = await enterFightAndMeasure(page, 'canvas');
  const bridge = await enterFightAndMeasure(page, 'bridge');

  expect(canvas.count).toBeGreaterThanOrEqual(90);
  expect(bridge.count).toBeGreaterThanOrEqual(90);
  expect(canvas.p95Ms).toBeGreaterThan(0);
  expect(bridge.p95Ms).toBeGreaterThan(0);
  const p95Ratio = bridge.p95Ms / canvas.p95Ms;
  console.info('Ethic renderer performance', { canvas, bridge, p95Ratio });
  expect(bridge.p95Ms).toBeLessThan(1000 / 60);
  expect(p95Ratio).toBeLessThan(50);

  await page.goto('');
  await page.waitForFunction(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().ready === true);
  expect(
    await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().renderer.backend)
  ).toBe('canvas2d');
});

test('fills the available viewport while preserving 16:9 renderer alignment', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.goto('?renderer=bridge');
  await page.waitForFunction(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().ready === true);
  await page.evaluate(async () => {
    const api = window.__ETHIC_BRAWL_E2E__;
    if (!api) throw new Error('E2E probe unavailable');
    await api.transitionTo('character-select');
    await api.transitionTo('fight');
  });
  await page.waitForFunction(
    () => window.__ETHIC_BRAWL_E2E__?.getSnapshot().currentScene === 'fight'
  );

  const readRects = () =>
    page.evaluate(() => {
      const game = document.getElementById('game-canvas')?.getBoundingClientRect();
      const bridge = document.getElementById('ethic-pixi-bridge')?.getBoundingClientRect();
      return game && bridge
        ? {
            game: { x: game.x, y: game.y, width: game.width, height: game.height },
            bridge: { x: bridge.x, y: bridge.y, width: bridge.width, height: bridge.height },
          }
        : null;
    });

  const expectAligned = (
    actual: Awaited<ReturnType<typeof readRects>>,
    expected: { x: number; y: number; width: number; height: number }
  ) => {
    expect(actual).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(actual?.game[key]).toBeCloseTo(expected[key], 0);
      expect(actual?.bridge[key]).toBeCloseTo(actual?.game[key] ?? 0, 1);
    }
  };

  expectAligned(await readRects(), { x: 0, y: 218.75, width: 1000, height: 562.5 });

  await page.setViewportSize({ width: 1600, height: 700 });
  expectAligned(await readRects(), { x: 177.78, y: 0, width: 1244.44, height: 700 });
});
