import { expect, test, type Page } from '@playwright/test';

interface ImageMetrics {
  width: number;
  height: number;
  meanLuma: number;
  chromaRatio: number;
  darkRatio: number;
  brightRatio: number;
  edgeRatio: number;
}

async function imageMetrics(page: Page, png: Buffer): Promise<ImageMetrics> {
  const source = `data:image/png;base64,${png.toString('base64')}`;
  return page.evaluate(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('2D metrics context unavailable');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let samples = 0;
    let lumaTotal = 0;
    let chroma = 0;
    let dark = 0;
    let bright = 0;
    let edges = 0;
    const stride = 4;
    for (let y = 0; y < canvas.height; y += stride) {
      for (let x = 0; x < canvas.width; x += stride) {
        const offset = (y * canvas.width + x) * 4;
        const r = pixels[offset] ?? 0;
        const g = pixels[offset + 1] ?? 0;
        const b = pixels[offset + 2] ?? 0;
        const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const spread = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
        lumaTotal += luma;
        chroma += Number(spread > 0.18);
        dark += Number(luma < 0.18);
        bright += Number(luma > 0.72);
        if (x + stride < canvas.width) {
          const next = offset + stride * 4;
          const nextLuma =
            (0.2126 * (pixels[next] ?? 0) +
              0.7152 * (pixels[next + 1] ?? 0) +
              0.0722 * (pixels[next + 2] ?? 0)) /
            255;
          edges += Number(Math.abs(nextLuma - luma) > 0.2);
        }
        samples += 1;
      }
    }
    return {
      width: canvas.width,
      height: canvas.height,
      meanLuma: lumaTotal / samples,
      chromaRatio: chroma / samples,
      darkRatio: dark / samples,
      brightRatio: bright / samples,
      edgeRatio: edges / samples,
    };
  }, source);
}

async function capture(page: Page, mode: 'canvas' | 'bridge') {
  await page.goto(`?renderer=${mode}`);
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
  await page.waitForTimeout(350);
  const semantic = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot());
  if (!semantic) throw new Error('Missing semantic snapshot');
  const png = await page.locator('#game-container').screenshot();
  return { semantic, metrics: await imageMetrics(page, png) };
}

test('Canvas and retained Pixi compositions preserve semantic and visual structure', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const baseURL = String(test.info().project.use.baseURL);
  const measure = async (mode: 'canvas' | 'bridge') => {
    const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    try {
      return await capture(page, mode);
    } finally {
      await context.close();
    }
  };
  const canvas = await measure('canvas');
  const bridge = await measure('bridge');

  expect(bridge.semantic.fight.player1Character).toBe(canvas.semantic.fight.player1Character);
  expect(bridge.semantic.fight.player2Character).toBe(canvas.semantic.fight.player2Character);
  expect(bridge.semantic.fight.player1Health).toBe(canvas.semantic.fight.player1Health);
  expect(bridge.semantic.fight.player2Health).toBe(canvas.semantic.fight.player2Health);
  expect(bridge.semantic.fight.player1Lane).toBe(canvas.semantic.fight.player1Lane);
  expect(bridge.semantic.fight.player2Lane).toBe(canvas.semantic.fight.player2Lane);
  expect(
    Math.abs((bridge.semantic.fight.player1X ?? 0) - (canvas.semantic.fight.player1X ?? 0))
  ).toBeLessThan(8);
  expect(
    Math.abs((bridge.semantic.fight.player2X ?? 0) - (canvas.semantic.fight.player2X ?? 0))
  ).toBeLessThan(8);

  expect(bridge.metrics.width).toBe(canvas.metrics.width);
  expect(bridge.metrics.height).toBe(canvas.metrics.height);
  expect(canvas.metrics.darkRatio).toBeGreaterThan(0.2);
  expect(bridge.metrics.darkRatio).toBeGreaterThan(0.2);
  expect(canvas.metrics.chromaRatio).toBeGreaterThan(0.08);
  expect(bridge.metrics.chromaRatio).toBeGreaterThan(0.08);
  expect(canvas.metrics.edgeRatio).toBeGreaterThan(0.01);
  expect(bridge.metrics.edgeRatio).toBeGreaterThan(0.01);
  expect(Math.abs(bridge.metrics.meanLuma - canvas.metrics.meanLuma)).toBeLessThan(0.28);
  expect(Math.abs(bridge.metrics.chromaRatio - canvas.metrics.chromaRatio)).toBeLessThan(0.35);
  console.info('Ethic visual parity metrics', { canvas: canvas.metrics, bridge: bridge.metrics });
});
