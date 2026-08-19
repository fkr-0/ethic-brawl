import { type Page, expect, test } from '@playwright/test';
import type { E2EProbeSnapshot } from '../src/app/e2e-probe';

async function getSnapshot(page: Page): Promise<E2EProbeSnapshot> {
  const snapshot = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot() ?? null);
  if (!snapshot) throw new Error('Ethic Brawl E2E probe is not installed');
  return snapshot;
}

async function waitForScene(page: Page, scene: E2EProbeSnapshot['currentScene']): Promise<void> {
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', scene ?? 'none', {
    timeout: 20_000,
  });
}

async function tapKey(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(70);
  await page.keyboard.up(key);
  await page.waitForTimeout(80);
}

test('surfaces Runtime transient notices for operator sprite controls', async ({ page }) => {
  await page.goto('index.html');
  await waitForScene(page, 'start');

  expect((await getSnapshot(page)).notice).toBeNull();

  await tapKey(page, 'F1');
  let snapshot = await getSnapshot(page);
  expect(snapshot.sprites.renderingEnabled).toBe(false);
  expect(snapshot.notice).toMatchObject({
    message: 'SPRITE RENDERING OFF',
    kind: 'warning',
  });
  await expect(page.locator('#e2e-status')).toHaveAttribute(
    'data-notice-message',
    'SPRITE RENDERING OFF'
  );

  const firstNoticeId = snapshot.notice?.id;
  await tapKey(page, 'F3');
  snapshot = await getSnapshot(page);
  expect(snapshot.notice?.id).toBe(firstNoticeId);
  expect(snapshot.notice?.message).toMatch(/^SPRITE SCALE /);

  await tapKey(page, 'F9');
  snapshot = await getSnapshot(page);
  expect(snapshot.notice).toMatchObject({ message: 'FRAME BOUNDS ON', kind: 'warning' });
});
