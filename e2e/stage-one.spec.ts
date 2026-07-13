import { expect, test, type Page } from '@playwright/test';
import type { E2EProbeSnapshot } from '../src/app/e2e-probe';

async function getSnapshot(page: Page): Promise<E2EProbeSnapshot> {
  const snapshot = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot() ?? null);
  if (!snapshot) {
    throw new Error('Ethic Brawl E2E probe is not installed');
  }
  return snapshot;
}

async function waitForScene(page: Page, scene: E2EProbeSnapshot['currentScene']): Promise<void> {
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', scene ?? 'none');
}

async function resolveCurrentMatch(page: Page, winner: 1 | 2): Promise<void> {
  await page.evaluate((matchWinner) => {
    window.__ETHIC_BRAWL_E2E__?.resolveCurrentMatch(matchWinner);
  }, winner);
}

async function walkPlayerOneIntoRange(page: Page): Promise<void> {
  for (let step = 0; step < 30; step++) {
    const snapshot = await getSnapshot(page);
    const player1X = snapshot.fight.player1X;
    const player2X = snapshot.fight.player2X;
    if (player1X === null || player2X === null) {
      throw new Error('Fight positions are unavailable');
    }
    if (Math.abs(player2X - player1X) <= 62) return;

    await page.keyboard.down('KeyD');
    await page.waitForTimeout(80);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(25);
  }
  throw new Error('Player 1 could not move into attack range');
}

test('loads every coded sprite and completes the Babylon Stage 1 vertical slice', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      runtimeErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto('/');
  await waitForScene(page, 'start');

  const bootSnapshot = await getSnapshot(page);
  expect(bootSnapshot.sprites.requestedCharacters).toBe(18);
  expect(bootSnapshot.sprites.loadedCharacters).toBe(18);
  expect(bootSnapshot.sprites.failedCharacters).toEqual([]);
  expect(bootSnapshot.canvas.width).toBe(960);
  expect(bootSnapshot.canvas.height).toBe(540);

  await page.keyboard.press('KeyS');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-start-menu-index', '1');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'character-select');

  await page.keyboard.press('Enter');
  await waitForScene(page, 'stage-intro');
  let snapshot = await getSnapshot(page);
  expect(snapshot.app.gameMode).toBe('stage');
  expect(snapshot.app.stageEncounterIndex).toBe(0);
  expect(snapshot.app.pendingSelection.player2).toBe('socrates');

  await page.keyboard.press('Enter');
  await waitForScene(page, 'fight');
  snapshot = await getSnapshot(page);
  expect(snapshot.fight.player1Character).toBe('camus');
  expect(snapshot.fight.player2Character).toBe('socrates');

  const startingEnemyHealth = snapshot.fight.player2Health;
  expect(startingEnemyHealth).not.toBeNull();
  await walkPlayerOneIntoRange(page);

  let damagedEnemyHealth = startingEnemyHealth;
  for (let attack = 0; attack < 8; attack++) {
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(360);
    damagedEnemyHealth = (await getSnapshot(page)).fight.player2Health;
    if (
      damagedEnemyHealth !== null &&
      startingEnemyHealth !== null &&
      damagedEnemyHealth < startingEnemyHealth
    ) {
      break;
    }
  }
  expect(damagedEnemyHealth).not.toBeNull();
  expect(damagedEnemyHealth as number).toBeLessThan(startingEnemyHealth as number);

  await resolveCurrentMatch(page, 1);
  await waitForScene(page, 'stage-intro');
  snapshot = await getSnapshot(page);
  expect(snapshot.app.stageEncounterIndex).toBe(1);
  expect(snapshot.app.stageEncounterWins).toBe(1);
  expect(snapshot.app.pendingSelection.player2).toBe('schmitt');

  await page.keyboard.press('Enter');
  await waitForScene(page, 'fight');
  expect((await getSnapshot(page)).fight.player2Character).toBe('schmitt');
  await resolveCurrentMatch(page, 1);
  await waitForScene(page, 'stage-intro');
  snapshot = await getSnapshot(page);
  expect(snapshot.app.stageEncounterIndex).toBe(2);
  expect(snapshot.app.stageEncounterWins).toBe(2);
  expect(snapshot.app.pendingSelection.player2).toBe('machiavelli');

  await page.keyboard.press('Enter');
  await waitForScene(page, 'fight');
  expect((await getSnapshot(page)).fight.player2Character).toBe('machiavelli');
  await resolveCurrentMatch(page, 1);
  await waitForScene(page, 'trial');
  expect((await getSnapshot(page)).app.stageEncounterWins).toBe(3);

  await page.keyboard.press('Enter');
  await waitForScene(page, 'upgrade');
  await page.keyboard.press('Enter');
  await waitForScene(page, 'results');
  expect((await getSnapshot(page)).app.stageNumber).toBe(2);

  await page.keyboard.press('Enter');
  await waitForScene(page, 'start');
  expect(runtimeErrors).toEqual([]);
});
