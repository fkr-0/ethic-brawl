import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

describe('AppImage release workflow', () => {
  it('packages an exact annotated tag and publishes explicit artifacts', async () => {
    const workflow = await readFile(
      resolve(root, '.github', 'workflows', 'release-appimage.yml'),
      'utf8'
    );
    const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

    expect(workflow).toMatch(/tags: \['v\*\.\*\.\*'\]/);
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('must be an annotated tag');
    expect(workflow).toContain('git checkout --detach "refs/tags/$RELEASE_TAG"');
    expect(workflow).toContain('node scripts/verify-release-train.mjs');
    expect(workflow).toContain('node scripts/verify-runtime-consumption.mjs');
    expect(workflow).toContain('pnpm build');
    expect(workflow).toContain('electron-builder --linux AppImage --publish never');
    expect(packageJson.scripts['desktop:appimage']).toMatch(/--publish never$/);
    expect(workflow).toContain('--appimage-version');
    expect(workflow).toContain('sha256sum');
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('gh release create');
    expect(workflow).toContain('gh release upload');
    expect(workflow).toMatch(/permissions:\n {2}contents: write/);
  });
});
