import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Animation v2 renderer-source contract', () => {
  it('normalizes the fixed 1254px RGB chroma-key source contract', () => {
    expect(() =>
      execFileSync('python3', ['scripts/normalize-animation-v2-render.py', '--self-test'], {
        stdio: 'pipe',
      })
    ).not.toThrow();
  });

  it('keeps renderer provenance separate from the runtime RGBA contract', () => {
    const pack = readFileSync('docs/prompts/fighter-animation-v2/prompt-pack.yml', 'utf8');
    expect(pack).toContain('1254x1254 RGB');
    expect(pack).toContain('#FF00FF');
    expect(pack).toContain('sampled from the border');
    expect(pack).toContain('90% bottom-center safe-padding fit');
    expect(pack).toContain('exact 1024x1024 RGBA runtime sheet');
    expect(pack).toContain('floor(i * 1254 / 4)');
  });
});
