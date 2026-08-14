import { expect, test, type Page, type TestInfo } from '@playwright/test';
import type { SceneName } from '../src/core/state/scene-manager';

interface UiImageMetrics {
  width: number;
  height: number;
  meanLuma: number;
  darkRatio: number;
  brightRatio: number;
  chromaRatio: number;
  edgeRatio: number;
}

async function transitionTo(page: Page, scene: SceneName): Promise<void> {
  const transitioned = await page.evaluate(async (target) => {
    const api = window.__ETHIC_BRAWL_E2E__;
    if (!api) throw new Error('Ethic Brawl E2E probe is unavailable');
    return api.transitionTo(target);
  }, scene);
  expect(transitioned, `transition to ${scene}`).toBe(true);
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', scene);
  await page.waitForTimeout(scene === 'fight' ? 450 : 120);
}

async function tapKey(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(70);
  await page.keyboard.up(key);
  await page.waitForTimeout(70);
}

async function metrics(page: Page, png: Buffer): Promise<UiImageMetrics> {
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('UI metrics canvas is unavailable');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let samples = 0;
    let lumaTotal = 0;
    let dark = 0;
    let bright = 0;
    let chroma = 0;
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
        dark += Number(luma < 0.18);
        bright += Number(luma > 0.72);
        chroma += Number(spread > 0.18);
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
      darkRatio: dark / samples,
      brightRatio: bright / samples,
      chromaRatio: chroma / samples,
      edgeRatio: edges / samples,
    };
  }, png.toString('base64'));
}

async function captureUi(page: Page, testInfo: TestInfo, name: string): Promise<UiImageMetrics> {
  const png = await page.locator('#game-container').screenshot();
  await testInfo.attach(`${name}.png`, { body: png, contentType: 'image/png' });
  const result = await metrics(page, png);
  expect(result.width).toBeGreaterThan(600);
  expect(result.height).toBeGreaterThan(300);
  expect(result.meanLuma).toBeGreaterThan(0.035);
  expect(result.meanLuma).toBeLessThan(0.62);
  expect(result.darkRatio).toBeGreaterThan(0.22);
  expect(result.brightRatio).toBeGreaterThan(0.002);
  expect(result.chromaRatio).toBeGreaterThan(0.012);
  expect(result.edgeRatio).toBeGreaterThan(0.006);
  console.info(`Ethic UI metrics: ${name}`, result);
  return result;
}

test('arcade shell, settings, roster, and fight HUD remain readable and visually structured', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'one deterministic Chromium UI review is sufficient');
  test.setTimeout(120_000);
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.addInitScript(() => {
    localStorage.setItem(
      'ethic_brawl_settings',
      JSON.stringify({ bindings: { player1: { moveLeft: ['KeyZ'] } } })
    );
  });
  await page.goto('index.html');
  await page.waitForFunction(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot().ready === true, null, {
    timeout: 40_000,
  });
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', 'start');
  await expect(page.locator('#e2e-status')).toHaveAttribute(
    'data-player1-move-left-binding',
    'KeyZ'
  );
  const start = await captureUi(page, testInfo, 'ui-main-menu');

  await transitionTo(page, 'settings');
  const settings = await captureUi(page, testInfo, 'ui-settings');
  await tapKey(page, 'd');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-settings-tab', 'accessibility');
  await tapKey(page, 'd');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-settings-tab', 'keybindings');
  await page.waitForTimeout(120);
  const keybindings = await captureUi(page, testInfo, 'ui-keybindings');

  await page.keyboard.down('Shift');
  await tapKey(page, '/');
  await page.keyboard.up('Shift');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-help-open', 'true');
  const help = await captureUi(page, testInfo, 'ui-live-remapped-help');
  await page.keyboard.down('Shift');
  await tapKey(page, '/');
  await page.keyboard.up('Shift');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-help-open', 'false');

  await transitionTo(page, 'start');
  await transitionTo(page, 'character-select');
  const roster = await captureUi(page, testInfo, 'ui-character-select');

  await transitionTo(page, 'fight');
  const fight = await captureUi(page, testInfo, 'ui-fight-hud');

  expect(settings.edgeRatio).toBeGreaterThan(start.edgeRatio * 0.7);
  expect(keybindings.edgeRatio).toBeGreaterThan(settings.edgeRatio * 0.85);
  expect(help.edgeRatio).toBeGreaterThan(keybindings.edgeRatio * 0.75);
  expect(roster.chromaRatio).toBeGreaterThan(0.035);
  expect(fight.chromaRatio).toBeGreaterThan(0.07);
  expect(runtimeErrors).toEqual([]);
});
