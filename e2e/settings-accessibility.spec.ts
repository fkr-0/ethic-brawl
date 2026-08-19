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
  await page.waitForTimeout(60);
}

test('persists accessibility policy and spectator density through the real settings shell', async ({
  page,
}) => {
  await page.goto('index.html');
  await waitForScene(page, 'start');

  for (let index = 0; index < 3; index++) await tapKey(page, 's');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'settings');

  await tapKey(page, 's');
  await tapKey(page, 'Enter');
  expect((await getSnapshot(page)).app.spectatorDetail).toBe('lab');

  await tapKey(page, 'd');
  expect((await getSnapshot(page)).app.settingsTab).toBe('accessibility');
  await tapKey(page, 'Enter');
  await tapKey(page, 's');
  await tapKey(page, 'Enter');

  const configured = await getSnapshot(page);
  expect(configured.app.impactMotion).toBe('reduced');
  expect(configured.app.combatFlashes).toBe('reduced');
  expect(configured.renderer.screenFeedbackScale).toBeCloseTo(0.28);
  expect(configured.renderer.fighterFlashScale).toBeCloseTo(0.28);

  const persisted = await page.evaluate(() => {
    const stored = localStorage.getItem('ethic_brawl_settings');
    return stored ? JSON.parse(stored) : null;
  });
  expect(persisted).toMatchObject({
    format: 1,
    version: 1,
    data: {
      schemaVersion: 2,
      impactMotion: 'reduced',
      combatFlashes: 'reduced',
      spectatorDetail: 'lab',
    },
  });

  await page.reload();
  await waitForScene(page, 'start');
  const restored = await getSnapshot(page);
  expect(restored.app.impactMotion).toBe('reduced');
  expect(restored.app.combatFlashes).toBe('reduced');
  expect(restored.app.spectatorDetail).toBe('lab');
  expect(restored.renderer.screenFeedbackScale).toBeCloseTo(0.28);
});
