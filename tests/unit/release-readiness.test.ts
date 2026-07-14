import { describe, expect, it } from 'vitest';
import workflow from '../../.github/workflows/release-check.yml?raw';
import testingGuide from '../../docs/testing.md?raw';
import packageJson from '../../package.json?raw';
import releaseScript from '../../scripts/release-check.mjs?raw';
import todoList from '../../todo.md?raw';

describe('major release readiness assets', () => {
  it('documents the release todo and marks shippable gates complete', () => {
    expect(todoList).toContain('# Ethic Brawl v1.0 Release Todo');
    expect(todoList).toContain('- [x] Establish release verification gate');
    expect(todoList).toContain('- [x] Restore lint gate to green');
    expect(todoList).toContain('- [x] Document test and release commands');
    expect(todoList).toContain('- [x] Add CI release verification workflow');
    expect(todoList).toContain('- [x] Add a scripted local release check');
    expect(todoList).toContain('- [ ] Manual browser smoke test before tagging');
  });

  it('documents exact verification commands for local release checks', () => {
    for (const command of [
      'pnpm lint',
      'pnpm typecheck',
      'pnpm test:run',
      'pnpm build',
      'pnpm test:e2e',
      'pnpm release:check',
    ]) {
      expect(testingGuide).toContain(command);
    }
  });

  it('ships automation for CI and local release verification', () => {
    expect(releaseScript).toContain('spawnSync');
    expect(packageJson).toContain('"release:check"');

    for (const command of [
      'pnpm lint',
      'pnpm typecheck',
      'pnpm test:run',
      'pnpm build',
      'pnpm test:e2e',
    ]) {
      expect(workflow).toContain(command);
    }
  });
});
