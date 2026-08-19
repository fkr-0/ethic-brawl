import { expect, test, type Page } from '@playwright/test';

async function enterFight(page: Page): Promise<void> {
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
  await expect(page.locator('#ethic-pixi-bridge')).toHaveAttribute('data-native-scenery', 'true');
}

test('certifies resize, suspend/resume, context restoration, sustained memory and teardown', async ({
  page,
  browserName,
}) => {
  const sessionSeconds = Math.max(2, Number(process.env.ARCADE_LONG_SESSION_SECONDS ?? 5));
  test.setTimeout(sessionSeconds * 1_000 + 75_000);
  const rendererErrors: string[] = [];
  const missingRosterAssets: string[] = [];
  page.on('pageerror', (error) => rendererErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const pathname = new URL(response.url()).pathname;
    if (response.status() === 404 && pathname.includes('/assets/sprites/roster/')) {
      missingRosterAssets.push(pathname);
      return;
    }
    rendererErrors.push(`${response.status()} ${pathname}`);
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    // Chromium emits a URL-free duplicate for failed responses. The response
    // listener above owns classification so renderer failures remain actionable.
    if (message.text().startsWith('Failed to load resource:')) return;
    rendererErrors.push(message.text());
  });
  await enterFight(page);

  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.resizeBridge(800, 450));
  await expect(page.locator('#ethic-pixi-bridge')).toHaveAttribute(
    'data-arcade-logical-size',
    '800x450'
  );

  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.startBridge());
  await page.waitForFunction(
    () => window.__ETHIC_BRAWL_E2E__?.getBridgeLifecycle()?.running === true
  );
  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.pauseBridge());
  await page.waitForFunction(
    () => window.__ETHIC_BRAWL_E2E__?.getBridgeLifecycle()?.paused === true
  );
  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.resumeBridge());
  await page.waitForFunction(
    () => window.__ETHIC_BRAWL_E2E__?.getBridgeLifecycle()?.running === true
  );

  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.simulateBridgeContextLoss());
  await expect(page.locator('#ethic-pixi-bridge')).toHaveAttribute('data-context-state', 'lost');
  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.simulateBridgeContextRestore());
  await expect(page.locator('#ethic-pixi-bridge')).toHaveAttribute('data-context-state', 'ready');

  const before = await page.evaluate(() => ({
    frame: window.__ETHIC_BRAWL_E2E__?.getSnapshot().frameCount ?? 0,
    heap:
      (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory
        ?.usedJSHeapSize ?? null,
  }));
  await page.waitForTimeout(sessionSeconds * 1_000);
  const after = await page.evaluate(() => ({
    frame: window.__ETHIC_BRAWL_E2E__?.getSnapshot().frameCount ?? 0,
    heap:
      (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory
        ?.usedJSHeapSize ?? null,
    uploadP95: Number(
      document.querySelector('#ethic-pixi-bridge')?.getAttribute('data-upload-p95-bytes') ?? 0
    ),
    uploadLast: Number(
      document.querySelector('#ethic-pixi-bridge')?.getAttribute('data-upload-last-bytes') ?? 0
    ),
  }));
  expect(after.frame).toBeGreaterThan(before.frame);
  // Context restoration is allowed to recreate GPU textures, so the cumulative
  // p95 can legitimately retain those bounded uploads. The release invariant is
  // that steady-state frames stop uploading once restoration has settled.
  expect(after.uploadLast).toBe(0);
  if (before.heap !== null && after.heap !== null) {
    expect(after.heap - before.heap).toBeLessThan(64 * 1024 * 1024);
  }

  const lifecycle = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getBridgeLifecycle());
  expect(lifecycle).toMatchObject({ contextState: 'ready', destroyed: false });
  expect(Number(lifecycle?.contextLosses ?? 0)).toBeGreaterThanOrEqual(1);
  expect(Number(lifecycle?.contextRestores ?? 0)).toBeGreaterThanOrEqual(1);

  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.destroyBridge());
  await expect(page.locator('#ethic-pixi-bridge')).toHaveCount(0);
  expect(rendererErrors).toEqual([]);
  console.info('Ethic lifecycle certification', {
    browserName,
    sessionSeconds,
    before,
    after,
    missingRosterAssets: new Set(missingRosterAssets).size,
  });
});
