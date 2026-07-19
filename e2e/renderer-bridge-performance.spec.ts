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
  expect(snapshot.renderer.backend).toBe(mode === 'bridge' ? 'pixi-canvas-bridge' : 'canvas2d');
  if (mode === 'bridge') {
    await expect(page.locator('#ethic-pixi-bridge')).toBeVisible();
    await expect(page.locator('#ethic-pixi-bridge')).toHaveAttribute(
      'data-arcade-passes',
      'background,arena'
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
  expect(p95Ratio).toBeLessThan(25);

  console.info('Ethic renderer performance', { canvas, bridge, p95Ratio });

  await page.goto('');
  await page.waitForFunction(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().ready === true);
  expect(
    await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().renderer.backend)
  ).toBe('canvas2d');
});
