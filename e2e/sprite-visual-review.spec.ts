import { expect, type Page, test, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { E2EProbeSnapshot } from '../src/app/e2e-probe';

const CANONICAL_REVIEW_DIR = join(process.cwd(), 'generated', 'sprite-visual-review');

function reviewDirectory(testInfo: TestInfo): string {
  const configured = process.env.ETHIC_SPRITE_REVIEW_DIR;
  return configured
    ? resolve(process.cwd(), configured)
    : testInfo.outputPath('sprite-visual-review');
}

async function captureRecord(
  reviewDir: string,
  file: string
): Promise<{ file: string; bytes: number; sha256: string }> {
  const bytes = await readFile(join(reviewDir, file));
  return {
    file,
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

async function snapshot(page: Page): Promise<E2EProbeSnapshot> {
  const value = await page.evaluate(() => window.__ETHIC_BRAWL_E2E__?.getSnapshot() ?? null);
  if (!value) throw new Error('Ethic Brawl E2E probe is unavailable');
  return value;
}

async function tap(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(45);
  await page.keyboard.up(key);
  await page.waitForTimeout(45);
}

async function enterFoucaultMatch(page: Page): Promise<void> {
  await tap(page, 'Enter');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', 'character-select');
  for (let index = 0; index < 4; index += 1) await tap(page, 'd');
  await tap(page, 'Enter');
  await tap(page, 'Enter');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', 'fight');
  await expect.poll(async () => (await snapshot(page)).fight.player1Animation?.clipId).toBe('idle');
}

interface BrowserFrameCapture {
  dataUrl: string;
  snapshot: E2EProbeSnapshot;
  observed: string[];
}

async function captureReviewAttack(page: Page): Promise<BrowserFrameCapture> {
  const positions = await snapshot(page);
  const playerX = positions.fight.player1X;
  const opponentX = positions.fight.player2X;
  if (playerX !== null && opponentX !== null) {
    const retreatKey = opponentX >= playerX ? 'a' : 'd';
    await page.keyboard.down(retreatKey);
    await page.waitForTimeout(220);
    await page.keyboard.up(retreatKey);
    await page.waitForTimeout(80);
  }

  await page.evaluate(() => {
    const captureWindow = window as Window & {
      __ETHIC_SPRITE_ACTIVE_CAPTURE__?: BrowserFrameCapture | null;
      __ETHIC_SPRITE_ACTIVE_OBSERVED__?: string[];
    };
    captureWindow.__ETHIC_SPRITE_ACTIVE_CAPTURE__ = null;
    captureWindow.__ETHIC_SPRITE_ACTIVE_OBSERVED__ = [];
    const record = () => {
      if (captureWindow.__ETHIC_SPRITE_ACTIVE_CAPTURE__) return;
      const value = window.__ETHIC_BRAWL_E2E__?.getSnapshot();
      const animation = value?.fight.player1Animation;
      if (value && animation) {
        const signature = `${value.fight.player1State}:${animation.clipId}:${animation.attackPhase ?? 'none'}`;
        const observed = captureWindow.__ETHIC_SPRITE_ACTIVE_OBSERVED__ ?? [];
        if (observed.at(-1) !== signature) observed.push(signature);
        captureWindow.__ETHIC_SPRITE_ACTIVE_OBSERVED__ = observed;
        if (animation.attackPhase === 'active' && animation.clipId.startsWith('attack_light')) {
          const canvas = document.querySelector<HTMLCanvasElement>('canvas');
          if (!canvas) throw new Error('fight canvas is unavailable during active-frame capture');
          captureWindow.__ETHIC_SPRITE_ACTIVE_CAPTURE__ = {
            dataUrl: canvas.toDataURL('image/png'),
            snapshot: value,
            observed: [...observed],
          };
          return;
        }
      }
      requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.keyboard.down('j');
    await page.waitForTimeout(55);
    await page.keyboard.up('j');
    try {
      await page.waitForFunction(
        () =>
          Boolean(
            (window as Window & { __ETHIC_SPRITE_ACTIVE_CAPTURE__?: BrowserFrameCapture | null })
              .__ETHIC_SPRITE_ACTIVE_CAPTURE__
          ),
        undefined,
        { timeout: 1_500 }
      );
      const capture = await page.evaluate(
        () =>
          (window as Window & { __ETHIC_SPRITE_ACTIVE_CAPTURE__?: BrowserFrameCapture | null })
            .__ETHIC_SPRITE_ACTIVE_CAPTURE__ ?? null
      );
      if (capture) return capture;
    } catch {
      await page.waitForTimeout(180);
    }
  }
  const observed = await page.evaluate(
    () =>
      (window as Window & { __ETHIC_SPRITE_ACTIVE_OBSERVED__?: string[] })
        .__ETHIC_SPRITE_ACTIVE_OBSERVED__ ?? []
  );
  throw new Error(`active review attack was not captured; observed ${observed.join(' -> ')}`);
}

test('writes idle and active-attack sprite review captures', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'visual review PNGs are produced once with Chromium');
  const reviewDir = reviewDirectory(testInfo);
  await mkdir(reviewDir, { recursive: true });
  await page.goto('index.html');
  await expect(page.locator('#e2e-status')).toHaveAttribute('data-scene', 'start');
  await enterFoucaultMatch(page);

  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible();
  const canvasSize = await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }));
  const canvasBounds = await canvas.boundingBox();
  if (!canvasBounds) throw new Error('fight canvas display bounds are unavailable');
  const idle = await snapshot(page);
  expect(idle.fight.player1Character).toBe('foucault');
  expect(idle.fight.player1Animation?.clipId).toBe('idle');
  await canvas.screenshot({ path: join(reviewDir, 'ethic-fight-idle.png') });

  const activeCapture = await captureReviewAttack(page);
  const active = activeCapture.snapshot;
  const encodedPng = activeCapture.dataUrl.split(',', 2)[1];
  if (!encodedPng) throw new Error('active-frame canvas capture did not contain PNG data');
  await writeFile(
    join(reviewDir, 'ethic-light-attack-active.png'),
    Buffer.from(encodedPng, 'base64')
  );

  expect(active.fight.player1Animation?.attackPhase).toBe('active');
  expect(active.fight.player1Animation?.atlasFrameIndex).not.toBeNull();
  expect(active.fight.player1Animation?.depthScale).toBeGreaterThan(0.8);

  const captures = await Promise.all([
    captureRecord(reviewDir, 'ethic-fight-idle.png'),
    captureRecord(reviewDir, 'ethic-light-attack-active.png'),
  ]);
  await writeFile(
    join(reviewDir, 'index.json'),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        renderer: '@arcade/runtime drawArcadeSpriteCanvasFrame + Ethic presentation policy',
        canvas: {
          internal: canvasSize,
          display: {
            width: Math.round(canvasBounds.width),
            height: Math.round(canvasBounds.height),
          },
        },
        captures: [
          {
            ...captures[0],
            captureSpace: 'display',
            width: Math.round(canvasBounds.width),
            height: Math.round(canvasBounds.height),
            characterId: idle.fight.player1Character,
            clipId: idle.fight.player1Animation?.clipId ?? null,
            atlasFrameIndex: idle.fight.player1Animation?.atlasFrameIndex ?? null,
            depthScale: idle.fight.player1Animation?.depthScale ?? null,
          },
          {
            ...captures[1],
            captureSpace: 'internal-canvas',
            width: canvasSize.width,
            height: canvasSize.height,
            characterId: active.fight.player1Character,
            clipId: active.fight.player1Animation?.clipId ?? null,
            attackPhase: active.fight.player1Animation?.attackPhase ?? null,
            atlasFrameIndex: active.fight.player1Animation?.atlasFrameIndex ?? null,
            depthScale: active.fight.player1Animation?.depthScale ?? null,
          },
        ],
      },
      null,
      2
    )}\n`
  );

  for (const file of ['ethic-fight-idle.png', 'ethic-light-attack-active.png', 'index.json']) {
    await testInfo.attach(file, {
      path: join(reviewDir, file),
      contentType: file.endsWith('.json') ? 'application/json' : 'image/png',
    });
  }

  if (reviewDir === CANONICAL_REVIEW_DIR) {
    testInfo.annotations.push({
      type: 'review-output',
      description: 'Updated generated/sprite-visual-review canonical captures',
    });
  }
});
