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
  await page.waitForTimeout(80);
  await page.keyboard.up(key);
  await page.waitForTimeout(50);
}

interface BrowserDiagnostics {
  runtimeErrors: string[];
  missingOptionalSpriteAssets: string[];
}

function collectBrowserDiagnostics(page: Page): BrowserDiagnostics {
  const diagnostics: BrowserDiagnostics = {
    runtimeErrors: [],
    missingOptionalSpriteAssets: [],
  };

  page.on('pageerror', (error) => diagnostics.runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const pathname = new URL(response.url()).pathname;
    if (response.status() === 404 && pathname.includes('/assets/sprites/roster/')) {
      diagnostics.missingOptionalSpriteAssets.push(pathname);
      return;
    }
    diagnostics.runtimeErrors.push(`http ${response.status()}: ${pathname}`);
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    // Chromium emits a generic duplicate console error for every failed HTTP
    // response. The response listener above classifies the exact URL/status.
    if (message.text().startsWith('Failed to load resource:')) return;
    diagnostics.runtimeErrors.push(`console: ${message.text()}`);
  });

  return diagnostics;
}

async function enterCamusVsNietzscheShowcase(page: Page): Promise<E2EProbeSnapshot> {
  await page.goto('index.html');
  await waitForScene(page, 'start');
  await tapKey(page, 's');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-start-menu-index', '1');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'character-select');
  expect((await getSnapshot(page)).app.gameMode).toBe('ai-vs-ai');

  await tapKey(page, 'Enter');
  expect((await getSnapshot(page)).app.characterSelectPhase).toBe(2);
  for (let index = 0; index < 7; index++) await tapKey(page, 'd');
  expect((await getSnapshot(page)).app.player2SelectIndex).toBe(8);
  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  return getSnapshot(page);
}

test('runs a tactical full-roster AI showcase with natural 7–17 second rounds', async ({
  page,
}) => {
  const diagnostics = collectBrowserDiagnostics(page);
  const initial = await enterCamusVsNietzscheShowcase(page);

  expect(initial.fight.player1Character).toBe('camus');
  expect(initial.fight.player2Character).toBe('nietzsche');
  expect(initial.fight.player1AIDifficulty).toBe('medium');
  expect(initial.fight.player2AIDifficulty).toBe('medium');
  expect(initial.fight.rulesId).toBe('ai_showcase_sprint');
  expect(initial.fight.roundTimeSeconds).toBe(15);
  expect(initial.fight.player1X).not.toBeNull();
  expect(initial.fight.player2X).not.toBeNull();

  const startedAt = performance.now();
  const player1Actions = new Set<string>();
  const player2Actions = new Set<string>();
  const player1Attacks = new Set<string>();
  const player2Attacks = new Set<string>();
  const observedLanes = new Set<string>();
  let final = initial;

  while (performance.now() - startedAt < 18_000) {
    await page.waitForTimeout(100);
    final = await getSnapshot(page);
    player1Actions.add(final.fight.player1AIAction);
    player2Actions.add(final.fight.player2AIAction);
    if (final.fight.player1AttackId) player1Attacks.add(final.fight.player1AttackId);
    if (final.fight.player2AttackId) player2Attacks.add(final.fight.player2AttackId);
    observedLanes.add(`${final.fight.player1Lane}:${final.fight.player2Lane}`);
    if (final.fight.roundWinner !== null) break;
  }

  const elapsedSeconds = (performance.now() - startedAt) / 1000;
  expect(final.fight.roundWinner).not.toBeNull();
  expect(elapsedSeconds).toBeGreaterThanOrEqual(7);
  // Sampling and browser scheduling may add less than one polling interval.
  expect(elapsedSeconds).toBeLessThanOrEqual(17.2);
  expect(final.fight.round).toBe(1);
  expect(final.fight.roundTimeRemaining).toBeGreaterThanOrEqual(0);

  const allActions = new Set([...player1Actions, ...player2Actions]);
  expect(
    [...allActions].some((action) =>
      ['dash_approach', 'approach', 'circle', 'evade_lane', 'retreat', 'jump_attack'].includes(
        action
      )
    )
  ).toBe(true);
  expect([...allActions].some((action) => ['attack', 'combo'].includes(action))).toBe(true);
  expect(allActions.has('command_special')).toBe(true);
  expect(player1Attacks.size + player2Attacks.size).toBeGreaterThanOrEqual(3);
  expect(observedLanes.size).toBeGreaterThanOrEqual(2);

  await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.resolveCurrentMatch(2));
  await waitForScene(page, 'results');
  await tapKey(page, 'Backspace');
  await waitForScene(page, 'start');

  expect(diagnostics.runtimeErrors).toEqual([]);
  expect(
    diagnostics.missingOptionalSpriteAssets.every((path) =>
      path.includes('/assets/sprites/roster/')
    )
  ).toBe(true);
});
