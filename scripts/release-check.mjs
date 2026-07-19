#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const commands = [
  ['pnpm', ['assets:check']],
  ['pnpm', ['lint']],
  ['pnpm', ['typecheck']],
  ['pnpm', ['test:run']],
  ['pnpm', ['build']],
  ['pnpm', ['test:e2e']],
];

for (const [command, args] of commands) {
  const label = `${command} ${args.join(' ')}`;
  console.info(`\n==> ${label}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`\nRelease check failed at: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.info(
  '\nRelease check passed, including Stage 1, sprite-animation, and renderer-bridge browser E2E specifications.'
);
