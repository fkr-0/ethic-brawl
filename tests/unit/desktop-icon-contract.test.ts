import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

describe('desktop icon contract', () => {
  it('ships a 512px RGBA PNG and wires it into Linux packaging', async () => {
    const bytes = await readFile(resolve(root, 'desktop', 'icon.png'));
    const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    expect(bytes.toString('ascii', 12, 16)).toBe('IHDR');
    expect(bytes.readUInt32BE(16)).toBe(512);
    expect(bytes.readUInt32BE(20)).toBe(512);
    expect(bytes[25]).toBe(6); // PNG truecolor with alpha
    expect(packageJson.build.linux.icon).toBe('desktop/icon.png');
    expect(packageJson.scripts['desktop:icon:check']).toContain('--check');
  });
});
