import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('turns sprite audit evidence into a keyboard-accessible review deck', async ({ page }) => {
  const [document, report] = await Promise.all([
    readFile('generated/sprite-audit/index.html', 'utf8'),
    readFile('generated/sprite-audit/report.json', 'utf8').then((value) =>
      JSON.parse(value)
    ) as Promise<{
      assets: Array<{ errors: string[]; warnings: string[] }>;
    }>,
  ]);
  const hardCount = report.assets.filter(({ errors }) => errors.length > 0).length;
  const reviewCount = report.assets.filter(
    ({ errors, warnings }) => errors.length === 0 && warnings.length > 0
  ).length;
  const cleanCount = report.assets.length - hardCount - reviewCount;
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setContent(document, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('article')).toHaveCount(report.assets.length);
  await expect(page.locator('#count')).toHaveText(
    `${report.assets.length} / ${report.assets.length} assets`
  );

  await page.getByRole('button', { name: 'Hard errors' }).click();
  await expect(page.locator('article')).toHaveCount(hardCount);
  await expect(page.getByRole('button', { name: 'Hard errors' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(reviewCount);
  await page.getByRole('button', { name: 'Structurally clean' }).click();
  await expect(page.locator('article')).toHaveCount(cleanCount);

  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.keyboard.press('/');
  await expect(page.locator('#search')).toBeFocused();
  await page.keyboard.type('rocket_launcher');
  await expect(page.locator('article')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await expect(page.locator('article')).toHaveCount(report.assets.length);
  expect(runtimeErrors).toEqual([]);
});
