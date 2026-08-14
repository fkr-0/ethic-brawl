#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const result = spawnSync('python3', ['scripts/audit-sprite-assets.py', '--fail-on-errors'], {
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
