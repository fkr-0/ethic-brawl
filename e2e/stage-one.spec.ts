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
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', scene ?? 'none');
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

async function damageEnemyWithPlayerOne(page: Page, startingHealth: number): Promise<number> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const snapshot = await getSnapshot(page);
    const player1X = snapshot.fight.player1X;
    const player2X = snapshot.fight.player2X;
    const player1Lane = snapshot.fight.player1Lane;
    const player2Lane = snapshot.fight.player2Lane;
    const enemyHealth = snapshot.fight.player2Health;
    if (
      player1X === null ||
      player2X === null ||
      player1Lane === null ||
      player2Lane === null ||
      enemyHealth === null
    ) {
      throw new Error('Fight contact data is unavailable');
    }
    if (enemyHealth < startingHealth) return enemyHealth;

    if (player1Lane !== player2Lane) {
      await tapKey(page, player1Lane < player2Lane ? 'w' : 's', 90);
      await page.waitForTimeout(180);
      continue;
    }

    const distance = player2X - player1X;
    if (Math.abs(distance) > 54) {
      await tapKey(page, distance > 0 ? 'd' : 'a', 135);
      continue;
    }

    await tapKey(page, 'j', 70);
    await page.waitForTimeout(190);
  }
  return (await getSnapshot(page)).fight.player2Health ?? startingHealth;
}

test('loads every coded sprite and completes the Babylon Stage 1 vertical slice', async ({
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
  expect(bootSnapshot.sprites.requestedCharacters).toBe(18);
  expect(bootSnapshot.sprites.loadedCharacters).toBe(18);
  expect(bootSnapshot.sprites.failedCharacters).toEqual([]);
  expect(bootSnapshot.canvas.width).toBe(960);
  expect(bootSnapshot.canvas.height).toBe(540);
  expect(bootSnapshot.renderer.backend).toBe('canvas2d');
  expect(bootSnapshot.renderer.pixiInstalled).toBe(false);
  expect(bootSnapshot.renderer.rendererNeutralPresentation).toBe(true);

  await tapKey(page, 's');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-start-menu-index', '1');
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

  const startingEnemyHealth = (await getSnapshot(page)).fight.player2Health;
  expect(startingEnemyHealth).not.toBeNull();
  const damagedEnemyHealth = await damageEnemyWithPlayerOne(page, startingEnemyHealth as number);
  expect(damagedEnemyHealth).toBeLessThan(startingEnemyHealth as number);
  snapshot = await getSnapshot(page);
  expect(snapshot.fight.particleCapacity).toBe(320);
  expect(snapshot.fight.emittedParticleBursts).toBeGreaterThan(0);
  expect(snapshot.fight.recycledParticles).toBe(0);

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
