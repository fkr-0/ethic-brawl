import { type Page, expect, test } from '@playwright/test';
import type { E2EProbeSnapshot } from '../src/app/e2e-probe';

async function getSnapshot(page: Page): Promise<E2EProbeSnapshot> {
  const snapshot = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot() ?? null);
  if (!snapshot) {
    throw new Error('Ethic Brawl E2E probe is not installed');
  }
  return snapshot;
}

async function waitForScene(page: Page, scene: E2EProbeSnapshot['currentScene']): Promise<void> {
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', scene ?? 'none', {
    timeout: 20_000,
  });
}

async function resolveCurrentMatch(page: Page, winner: 1 | 2): Promise<void> {
  await page.evaluate((matchWinner) => {
    window.__ETHIC_BRAWL_E2E__?.resolveCurrentMatch(matchWinner);
  }, winner);
}

async function tapKey(page: Page, key: string, holdMilliseconds = 80): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMilliseconds);
  await page.keyboard.up(key);
  await page.waitForTimeout(40);
}

test('loads only the selected matchup and completes the Babylon Stage 1 vertical slice', async ({
  page,
}) => {
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

  await page.goto('index.html');
  await waitForScene(page, 'start');

  const bootSnapshot = await getSnapshot(page);
  expect(bootSnapshot.sprites.requestedCharacters).toBe(0);
  expect(bootSnapshot.sprites.loadedCharacters).toBe(0);
  expect(bootSnapshot.sprites.failedCharacters).toEqual([]);
  expect(bootSnapshot.canvas.width).toBe(960);
  expect(bootSnapshot.canvas.height).toBe(540);
  expect(bootSnapshot.canvas.clientWidth).toBe(1280);
  expect(bootSnapshot.canvas.clientHeight).toBe(720);
  expect(bootSnapshot.renderer.backend).toBe('canvas2d');
  expect(bootSnapshot.renderer.pixiInstalled).toBe(true);
  expect(bootSnapshot.renderer.bridgeEnabled).toBe(false);
  expect(bootSnapshot.renderer.rendererNeutralPresentation).toBe(true);

  await tapKey(page, 's');
  await tapKey(page, 's');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-start-menu-index', '2');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'character-select');

  await tapKey(page, 's');
  expect((await getSnapshot(page)).app.player1SelectIndex).toBe(6);
  await tapKey(page, 'w');
  expect((await getSnapshot(page)).app.player1SelectIndex).toBe(0);

  await tapKey(page, 'Enter');
  await waitForScene(page, 'stage-intro');
  let snapshot = await getSnapshot(page);
  expect(snapshot.app.gameMode).toBe('stage');
  expect(snapshot.app.stageEncounterIndex).toBe(0);
  expect(snapshot.app.pendingSelection.player2).toBe('socrates');
  expect(snapshot.renderer.profileId).toBe('babylon_market');
  expect(snapshot.renderer.stageEventId).toBe('market_caravan');

  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  snapshot = await getSnapshot(page);
  expect(snapshot.sprites.requestedCharacters).toBe(2);
  expect(snapshot.sprites.loadedCharacters).toBe(2);
  expect(snapshot.sprites.failedCharacters).toEqual([]);
  expect(snapshot.fight.player1Character).toBe('camus');
  expect(snapshot.fight.player2Character).toBe('socrates');
  expect(snapshot.fight.player2AIDifficulty).toBe('easy');
  expect(snapshot.fight.rulesId).toBe('market_procession');
  expect(snapshot.fight.roundTimeSeconds).toBe(99);
  expect(snapshot.fight.player2MaxHealth).toBeLessThan(100);
  const initialAiX = snapshot.fight.player2X;
  await page.waitForTimeout(400);
  const advancedAiX = (await getSnapshot(page)).fight.player2X;
  expect(initialAiX).not.toBeNull();
  expect(advancedAiX).not.toBeNull();
  expect(advancedAiX as number).toBeLessThan(initialAiX as number);

  // Keep a real browser-input combat assertion here without coupling the stage
  // routing test to AI-relative melee contact timing. Collision/contact/VFX
  // behavior has dedicated deterministic coverage elsewhere.
  await page.keyboard.down('j');
  try {
    const observedAttack = await page.waitForFunction(
      () => window.__ETHIC_BRAWL_E2E__?.getSnapshot().fight.player1AttackId ?? false,
      undefined,
      { polling: 'raf', timeout: 2_000 }
    );
    expect(await observedAttack.jsonValue()).not.toBeNull();
  } finally {
    await page.keyboard.up('j');
  }
  snapshot = await getSnapshot(page);
  expect(snapshot.fight.particleCapacity).toBe(320);

  await resolveCurrentMatch(page, 2);
  await waitForScene(page, 'results');
  snapshot = await getSnapshot(page);
  expect(snapshot.app.stageEncounterIndex).toBe(0);
  expect(snapshot.app.stageEncounterWins).toBe(0);
  expect(snapshot.app.hasLatestResult).toBe(true);

  await tapKey(page, 'Enter');
  await waitForScene(page, 'stage-intro');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  expect((await getSnapshot(page)).fight.player2AIDifficulty).toBe('easy');

  await resolveCurrentMatch(page, 1);
  await waitForScene(page, 'stage-intro');
  snapshot = await getSnapshot(page);
  expect(snapshot.app.stageEncounterIndex).toBe(1);
  expect(snapshot.app.stageEncounterWins).toBe(1);
  expect(snapshot.app.pendingSelection.player2).toBe('schmitt');
  expect(snapshot.renderer.profileId).toBe('babylon_archive');
  expect(snapshot.renderer.stageEventId).toBe('archive_scan');

  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  snapshot = await getSnapshot(page);
  expect(snapshot.fight.player2Character).toBe('schmitt');
  expect(snapshot.fight.player2AIDifficulty).toBe('medium');
  expect(snapshot.fight.rulesId).toBe('archive_lockdown');
  expect(snapshot.fight.roundTimeSeconds).toBe(84);
  expect(snapshot.fight.player2MaxHealth).toBeGreaterThan(100);
  await resolveCurrentMatch(page, 1);
  await waitForScene(page, 'stage-intro');
  snapshot = await getSnapshot(page);
  expect(snapshot.app.stageEncounterIndex).toBe(2);
  expect(snapshot.app.stageEncounterWins).toBe(2);
  expect(snapshot.app.pendingSelection.player2).toBe('machiavelli');
  expect(snapshot.renderer.profileId).toBe('babylon_gate');
  expect(snapshot.renderer.stageEventId).toBe('gate_heat_wave');

  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  snapshot = await getSnapshot(page);
  expect(snapshot.fight.player2Character).toBe('machiavelli');
  expect(snapshot.fight.player2AIDifficulty).toBe('hard');
  expect(snapshot.fight.rulesId).toBe('gate_judgment');
  expect(snapshot.fight.roundTimeSeconds).toBe(72);
  expect(snapshot.fight.player2Energy).toBeGreaterThan(snapshot.fight.player1Energy ?? 0);
  await resolveCurrentMatch(page, 1);
  await waitForScene(page, 'trial');
  expect((await getSnapshot(page)).app.stageEncounterWins).toBe(3);

  await tapKey(page, 'Enter');
  await waitForScene(page, 'upgrade');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'results');
  expect((await getSnapshot(page)).app.stageNumber).toBe(2);

  await tapKey(page, 'Enter');
  await waitForScene(page, 'start');
  expect(runtimeErrors).toEqual([]);
});
