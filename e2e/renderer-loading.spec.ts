import { expect, test, type Page } from '@playwright/test';

const OPTIONAL_RENDERER_ASSET =
  /\/assets\/(?:ethic-pixi-bridge|browserAll|webworkerAll|WebGLRenderer|WebGPURenderer|CanvasRenderer|RenderTargetSystem|BitmapFont|BufferResource|Filter)-/;

function collectOptionalRendererRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on('response', (response) => {
    const pathname = new URL(response.url()).pathname;
    if (OPTIONAL_RENDERER_ASSET.test(pathname)) requests.push(pathname);
  });
  return requests;
}

async function waitUntilReady(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().ready === true);
}

test('keeps every native-renderer asset off the default Canvas network path', async ({ page }) => {
  const optionalRequests = collectOptionalRendererRequests(page);
  await page.goto('');
  await waitUntilReady(page);

  const renderer = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().renderer);
  expect(renderer).toMatchObject({
    backend: 'canvas2d',
    bridgeEnabled: false,
    bridgeLoadStatus: 'disabled',
    bridgeLoadError: null,
  });
  expect(optionalRequests).toEqual([]);
});

test('loads the native renderer capability only after explicit opt-in', async ({ page }) => {
  const optionalRequests = collectOptionalRendererRequests(page);
  await page.goto('?renderer=bridge');
  await waitUntilReady(page);

  const renderer = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().renderer);
  expect(renderer).toMatchObject({
    backend: 'pixi-canvas-bridge',
    bridgeEnabled: true,
    bridgeLoadStatus: 'ready',
    bridgeLoadError: null,
  });
  expect(optionalRequests.some((pathname) => pathname.includes('/ethic-pixi-bridge-'))).toBe(true);
  await expect(page.locator('#ethic-pixi-bridge')).toHaveCount(1);
});
