import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { collectRuntimeSpriteAssets } from './sprite-asset-catalog.mjs';

export function runtimeSpriteProjection() {
  let projectRoot = process.cwd();
  let outputDirectory = resolve(projectRoot, 'dist');

  return {
    name: 'ethic-runtime-sprite-projection',
    apply: 'build',
    configResolved(config) {
      projectRoot = config.root;
      outputDirectory = resolve(projectRoot, config.build.outDir);
    },
    closeBundle() {
      const copied = [];
      const missing = [];
      for (const asset of collectRuntimeSpriteAssets(projectRoot)) {
        const sourcePath = resolve(projectRoot, asset.path);
        if (!existsSync(sourcePath)) {
          missing.push({ path: asset.path, category: asset.category });
          continue;
        }
        const targetPath = resolve(outputDirectory, asset.path);
        mkdirSync(dirname(targetPath), { recursive: true });
        copyFileSync(sourcePath, targetPath);
        copied.push({
          path: asset.path,
          category: asset.category,
          bytes: statSync(sourcePath).size,
          sha256: createHash('sha256').update(readFileSync(sourcePath)).digest('hex'),
        });
      }

      const manifestPath = resolve(outputDirectory, 'assets/sprites/runtime-manifest.json');
      mkdirSync(dirname(manifestPath), { recursive: true });
      writeFileSync(
        manifestPath,
        `${JSON.stringify({ schemaVersion: 1, copied, missing }, null, 2)}\n`
      );
      console.info(
        `Projected ${copied.length} canonical runtime sprites; ${missing.length} declared assets remain unrendered.`
      );
    },
  };
}
