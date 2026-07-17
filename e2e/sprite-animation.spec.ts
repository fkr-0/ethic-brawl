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

type FighterAnimation = NonNullable<E2EProbeSnapshot['fight']['player1Animation']>;

async function waitForPlayerOneAnimation(
  page: Page,
  description: string,
  predicate: (animation: FighterAnimation, snapshot: E2EProbeSnapshot) => boolean,
  timeoutMilliseconds = 1_200
): Promise<E2EProbeSnapshot> {
  const deadline = Date.now() + timeoutMilliseconds;
  const observed: string[] = [];
  while (Date.now() < deadline) {
    const snapshot = await getSnapshot(page);
    const animation = snapshot.fight.player1Animation;
    if (animation) {
      const signature = `${animation.state}:${animation.clipId}:${animation.attackPhase ?? 'none'}:${animation.frameBlend.toFixed(2)}`;
      if (observed.at(-1) !== signature) observed.push(signature);
      if (predicate(animation, snapshot)) return snapshot;
    }
    await page.waitForTimeout(8);
  }
  throw new Error(
    `Timed out waiting for ${description}. Observed: ${observed.slice(-12).join(' -> ')}`
  );
}

async function pressAndObserveClip(
  page: Page,
  key: string,
  clipId: string,
  timeoutMilliseconds = 1_200
): Promise<E2EProbeSnapshot> {
  await page.keyboard.down(key);
  try {
    return await waitForPlayerOneAnimation(
      page,
      clipId,
      (animation) => animation.clipId === clipId,
      timeoutMilliseconds
    );
  } finally {
    await page.keyboard.up(key);
  }
}

async function observeAttackClipSequence(
  page: Page,
  key: string,
  prefix: 'attack_light' | 'attack_special'
): Promise<E2EProbeSnapshot[]> {
  const startup = await pressAndObserveClip(page, key, `${prefix}_startup`);
  const active = await waitForPlayerOneAnimation(
    page,
    `${prefix}_active`,
    (animation) => animation.clipId === `${prefix}_active`
  );
  const recovery = await waitForPlayerOneAnimation(
    page,
    `${prefix}_recovery`,
    (animation) => animation.clipId === `${prefix}_recovery`
  );
  const settled = await waitForPlayerOneAnimation(
    page,
    'idle after attack',
    (animation, snapshot) => animation.clipId === 'idle' && snapshot.fight.player1State === 'idle',
    1_800
  );
  return [startup, active, recovery, settled];
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
  const idleBlend = await waitForPlayerOneAnimation(
    page,
    'an idle interpolation blend',
    (animation) => animation.clipId === 'idle' && animation.frameBlend > 0.05
  );
  expect(idleBlend.fight.player1Animation?.frameBlend).toBeLessThanOrEqual(1);
  expect(idleAnimations.every(({ frameBlend }) => frameBlend >= 0 && frameBlend <= 1)).toBe(true);

  await page.keyboard.down('d');
  const runBlendPromise = waitForPlayerOneAnimation(
    page,
    'a locomotion interpolation blend',
    (animation) => animation.clipId === 'run' && animation.frameBlend > 0.05
  );
  const movementSamples = await collectSnapshots(page, 720, 48);
  const runBlend = await runBlendPromise;
  await page.keyboard.up('d');
  expect(runBlend.fight.player1Animation?.frameBlend).toBeGreaterThan(0.05);
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
  expect(movementAnimations.every(({ playbackSpeed }) => playbackSpeed >= 0.72)).toBe(true);
  for (let index = 1; index < movementPositions.length; index += 1) {
    const delta = (movementPositions[index] ?? 0) - (movementPositions[index - 1] ?? 0);
    expect(delta).toBeGreaterThanOrEqual(-0.01);
    expect(delta).toBeLessThan(40);
  }

  const lightAttackSamples = await observeAttackClipSequence(page, 'j', 'attack_light');
  const lightAttackAnimations = playerOneAnimations(lightAttackSamples);
  expect(lightAttackAnimations.map(({ attackPhase }) => attackPhase)).toEqual([
    'startup',
    'active',
    'recovery',
    null,
  ]);
  expect(
    lightAttackAnimations.some(
      ({ transitionFromClipId, transitionAlpha }) =>
        transitionFromClipId !== null && transitionAlpha > 0
    )
  ).toBe(true);
  const specialSamples = await observeAttackClipSequence(page, 'i', 'attack_special');
  const specialAnimations = playerOneAnimations(specialSamples);
  expect(specialAnimations.map(({ attackPhase }) => attackPhase)).toEqual([
    'startup',
    'active',
    'recovery',
    null,
  ]);
  expect(specialAnimations.some(({ afterImageAlpha }) => afterImageAlpha > 0.1)).toBe(true);

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
  await page.keyboard.down('j');
  const contactSamplesPromise = collectSnapshots(page, 620, 16);
  await page.waitForTimeout(55);
  await page.keyboard.up('j');
  const contactSamples = await contactSamplesPromise;
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
