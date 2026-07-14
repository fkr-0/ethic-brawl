import { type Page, expect, test } from '@playwright/test';
import type { E2EProbeSnapshot } from '../src/app/e2e-probe';

async function getSnapshot(page: Page): Promise<E2EProbeSnapshot> {
  const snapshot = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot() ?? null);
  if (!snapshot) throw new Error('Ethic Brawl E2E probe is not installed');
  return snapshot;
}

async function waitForScene(page: Page, scene: E2EProbeSnapshot['currentScene']): Promise<void> {
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', scene ?? 'none');
}

async function tapKey(page: Page, key: string, holdMilliseconds = 45): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMilliseconds);
  await page.keyboard.up(key);
  await page.waitForTimeout(45);
}

async function collectSnapshots(
  page: Page,
  durationMilliseconds: number,
  intervalMilliseconds = 24
): Promise<E2EProbeSnapshot[]> {
  const samples: E2EProbeSnapshot[] = [];
  const deadline = Date.now() + durationMilliseconds;
  while (Date.now() < deadline) {
    samples.push(await getSnapshot(page));
    await page.waitForTimeout(intervalMilliseconds);
  }
  return samples;
}

async function triggerAndCollect(
  page: Page,
  key: string,
  durationMilliseconds: number
): Promise<E2EProbeSnapshot[]> {
  await page.keyboard.down(key);
  await page.waitForTimeout(12);
  await page.keyboard.up(key);
  return collectSnapshots(page, durationMilliseconds, 18);
}

function playerOneAnimations(samples: E2EProbeSnapshot[]) {
  return samples.flatMap((sample) =>
    sample.fight.player1Animation ? [sample.fight.player1Animation] : []
  );
}

async function enterAristotleVersusMatch(page: Page): Promise<void> {
  await tapKey(page, 'Enter');
  await waitForScene(page, 'character-select');
  for (let index = 0; index < 4; index += 1) await tapKey(page, 'd');
  expect((await getSnapshot(page)).app.player1SelectIndex).toBe(4);
  await tapKey(page, 'Enter');
  expect((await getSnapshot(page)).app.characterSelectPhase).toBe(2);
  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  await expect
    .poll(async () => (await getSnapshot(page)).fight.player1Animation?.clipId)
    .toBe('idle');
}

test('validates every sprite cell and exercises fluid browser animation transitions', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });

  await page.goto('index.html');
  await waitForScene(page, 'start');

  const validation = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSpriteValidation());
  expect(validation).toBeTruthy();
  if (!validation) throw new Error('Sprite validation report is unavailable');
  expect(validation.valid).toBe(true);
  expect(validation.characterCount).toBe(18);
  expect(validation.totalFrames).toBe(448);
  expect(validation.invalidCharacters).toEqual([]);
  expect(validation.blankFrameCount).toBe(0);
  expect(validation.backgroundLeakFrameCount).toBe(0);
  expect(validation.invalidClipReferenceCount).toBe(0);
  for (const character of Object.values(validation.characters)) {
    expect(character.valid, `${character.characterId}: ${character.issues.join('; ')}`).toBe(true);
    expect(character.minimumOpaqueCoverage).toBeGreaterThan(0.01);
    expect(character.maximumOpaqueCoverage).toBeLessThan(0.72);
  }

  await enterAristotleVersusMatch(page);
  let snapshot = await getSnapshot(page);
  expect(snapshot.fight.player1Character).toBe('aristotle');
  expect(snapshot.fight.player2Character).toBe('leibniz');
  expect(snapshot.fight.player1Animation?.clipFrameCount).toBe(4);
  expect(snapshot.fight.player1Animation?.transitionFromClipId).toBeNull();

  const idleAnimations = playerOneAnimations(await collectSnapshots(page, 720, 55)).filter(
    ({ clipId }) => clipId === 'idle'
  );
  expect(
    new Set(idleAnimations.map(({ atlasFrameIndex }) => atlasFrameIndex)).size
  ).toBeGreaterThan(2);
  expect(idleAnimations.some(({ frameBlend }) => frameBlend > 0.05)).toBe(true);
  expect(idleAnimations.every(({ frameBlend }) => frameBlend >= 0 && frameBlend <= 1)).toBe(true);

  await page.keyboard.down('d');
  const movementSamples = await collectSnapshots(page, 720, 48);
  await page.keyboard.up('d');
  const movementAnimations = playerOneAnimations(movementSamples).filter(
    ({ clipId }) => clipId === 'run'
  );
  const movementPositions = movementSamples.flatMap((sample) =>
    sample.fight.player1X === null ? [] : [sample.fight.player1X]
  );
  expect(movementAnimations.length).toBeGreaterThan(6);
  expect(
    new Set(movementAnimations.map(({ atlasFrameIndex }) => atlasFrameIndex)).size
  ).toBeGreaterThan(2);
  expect(movementAnimations.some(({ frameBlend }) => frameBlend > 0.05)).toBe(true);
  expect(movementAnimations.every(({ playbackSpeed }) => playbackSpeed >= 0.72)).toBe(true);
  for (let index = 1; index < movementPositions.length; index += 1) {
    const delta = (movementPositions[index] ?? 0) - (movementPositions[index - 1] ?? 0);
    expect(delta).toBeGreaterThanOrEqual(-0.01);
    expect(delta).toBeLessThan(40);
  }

  const lightAttackAnimations = playerOneAnimations(await triggerAndCollect(page, 'j', 760));
  const observedLightPhases = new Set(lightAttackAnimations.map(({ attackPhase }) => attackPhase));
  expect(observedLightPhases).toEqual(new Set(['startup', 'active', 'recovery', null]));
  for (const clipId of ['attack_light_startup', 'attack_light_active', 'attack_light_recovery']) {
    expect(lightAttackAnimations.some((animation) => animation.clipId === clipId)).toBe(true);
  }
  expect(
    lightAttackAnimations.some(
      ({ transitionFromClipId, transitionAlpha }) =>
        transitionFromClipId !== null && transitionAlpha > 0
    )
  ).toBe(true);
  expect(lightAttackAnimations.some(({ frameBlend }) => frameBlend > 0.05)).toBe(true);

  await expect.poll(async () => (await getSnapshot(page)).fight.player1State).toBe('idle');
  const specialAnimations = playerOneAnimations(await triggerAndCollect(page, 'i', 980));
  expect(specialAnimations.some(({ clipId }) => clipId === 'attack_special_startup')).toBe(true);
  expect(specialAnimations.some(({ clipId }) => clipId === 'attack_special_active')).toBe(true);
  expect(specialAnimations.some(({ clipId }) => clipId === 'attack_special_recovery')).toBe(true);
  expect(specialAnimations.some(({ afterImageAlpha }) => afterImageAlpha > 0.1)).toBe(true);

  await expect.poll(async () => (await getSnapshot(page)).fight.player1State).toBe('idle');
  const middleDepth = (await getSnapshot(page)).fight.player1Animation?.depthScale ?? 0;
  await tapKey(page, 'w', 70);
  await expect.poll(async () => (await getSnapshot(page)).fight.player1Lane).toBe(2);
  const backDepth = (await getSnapshot(page)).fight.player1Animation?.depthScale ?? 0;
  expect(backDepth).toBeLessThan(middleDepth);
  await tapKey(page, 's', 70);
  await expect.poll(async () => (await getSnapshot(page)).fight.player1Lane).toBe(1);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    snapshot = await getSnapshot(page);
    if (
      snapshot.fight.player1X !== null &&
      snapshot.fight.player2X !== null &&
      snapshot.fight.player2X - snapshot.fight.player1X <= 56
    ) {
      break;
    }
    await tapKey(page, 'd', 120);
  }
  const enemyHealthBefore = (await getSnapshot(page)).fight.player2Health;
  expect(enemyHealthBefore).not.toBeNull();
  const contactSamples = await triggerAndCollect(page, 'j', 620);
  const enemyHealthAfter = contactSamples.at(-1)?.fight.player2Health;
  expect(enemyHealthAfter).not.toBeNull();
  expect(enemyHealthAfter as number).toBeLessThan(enemyHealthBefore as number);
  expect(
    contactSamples.some(
      (sample) =>
        sample.fight.player2State === 'hitstun' &&
        sample.fight.player2Animation?.clipId === 'hitstun'
    )
  ).toBe(true);

  await tapKey(page, 'Backspace');
  await waitForScene(page, 'results');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'start');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'character-select');
  await tapKey(page, 'Enter');
  await tapKey(page, 'Enter');
  await waitForScene(page, 'fight');
  await expect
    .poll(async () => (await getSnapshot(page)).fight.player1Animation?.clipId)
    .toBe('idle');
  snapshot = await getSnapshot(page);
  expect(snapshot.fight.player1Animation?.attackPhase).toBeNull();
  expect(snapshot.fight.player1Animation?.transitionFromClipId).toBeNull();
  expect(snapshot.fight.player1Animation?.atlasFrameIndex).toBeGreaterThanOrEqual(0);
  expect(snapshot.fight.player1Animation?.atlasFrameIndex).toBeLessThanOrEqual(3);

  expect(runtimeErrors).toEqual([]);
});
