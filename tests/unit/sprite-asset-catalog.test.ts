import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { collectRuntimeSpriteAssets } from '../../scripts/sprite-asset-catalog.mjs';
import { describe, expect, it } from 'vitest';

describe('runtime sprite asset catalog', () => {
  it('derives every declared sprite family without duplicate paths', () => {
    const assets = collectRuntimeSpriteAssets(process.cwd());
    expect(assets).toHaveLength(298);
    expect(new Set(assets.map(({ path }) => path)).size).toBe(assets.length);
    expect(assets.filter(({ category }) => category === 'fighter')).toHaveLength(263);
    expect(assets.filter(({ category }) => category === 'item-overlay')).toHaveLength(19);
    expect(assets.filter(({ category }) => category === 'item-body-pose')).toHaveLength(11);
    expect(assets.filter(({ category }) => category === 'enemy')).toHaveLength(3);
    expect(assets.filter(({ category }) => category === 'item-icons')).toHaveLength(2);
    expect(
      assets.filter(
        ({ category, required }) =>
          (category === 'item-overlay' || category === 'item-body-pose') && required
      )
    ).toHaveLength(0);
    expect(
      assets.filter(({ category, required }) => category === 'item-icons' && required)
    ).toHaveLength(2);
    expect(
      assets.filter(
        ({ category, sourceContract }) =>
          category === 'fighter' && sourceContract === 'legacy-roster'
      ).length
    ).toBeGreaterThan(0);
    expect(
      assets.filter(
        ({ category, sourceContract }) =>
          category === 'fighter' && sourceContract === 'animation-v2'
      ).length
    ).toBeGreaterThan(0);
  });

  it('assigns every current hard audit error to an existing render job', () => {
    const report = JSON.parse(readFileSync('generated/sprite-audit/report.json', 'utf8')) as {
      assets: Array<{ path: string; errors: string[]; prompt_job: string | null }>;
    };
    for (const asset of report.assets.filter(({ errors }) => errors.length > 0)) {
      expect(asset.prompt_job, asset.path).toBeTruthy();
      expect(existsSync(resolve(asset.prompt_job ?? '')), asset.prompt_job ?? asset.path).toBe(
        true
      );
    }
  });
});
