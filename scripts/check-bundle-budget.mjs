#!/usr/bin/env node

import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = 'dist';
const MANIFEST_PATH = join(DIST_DIR, '.vite', 'manifest.json');
const HTML_PATH = join(DIST_DIR, 'index.html');
const ENTRY_BUDGET_BYTES = 90 * 1024;
const INITIAL_BUDGET_BYTES = 400 * 1024;
const OPTIONAL_RENDERER_BUDGET_BYTES = 640 * 1024;
const OPTIONAL_MARKERS = ['ethic-pixi-bridge', 'pixi-runtime', 'WebGLRenderer', 'WebGPURenderer'];

function fail(message) {
  console.error(`Bundle budget failed: ${message}`);
  process.exit(1);
}

function bytesFor(file) {
  return statSync(join(DIST_DIR, file)).size;
}

function collectImportClosure(manifest, keys, options = {}) {
  const includeDynamicImports = options.includeDynamicImports ?? false;
  const visitedKeys = new Set();
  const files = new Set();
  const visit = (key) => {
    if (visitedKeys.has(key)) return;
    visitedKeys.add(key);
    const chunk = manifest[key];
    if (!chunk) fail(`manifest import ${key} is missing`);
    files.add(chunk.file);
    for (const importedKey of chunk.imports ?? []) visit(importedKey);
    if (includeDynamicImports) {
      for (const importedKey of chunk.dynamicImports ?? []) visit(importedKey);
    }
  };
  for (const key of keys) visit(key);
  return files;
}

function totalBytes(files) {
  return [...files].reduce((total, file) => total + bytesFor(file), 0);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const html = readFileSync(HTML_PATH, 'utf8');
const htmlAssetReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(
  (match) => match[1]
);
const entryPair = Object.entries(manifest).find(([, chunk]) => chunk.isEntry);
if (!entryPair) fail('no application entry exists in the Vite manifest');
const [entryKey, entryChunk] = entryPair;
const bridgePair = Object.entries(manifest).find(
  ([, chunk]) => chunk.name === 'ethic-pixi-bridge' && chunk.isDynamicEntry
);
if (!bridgePair) fail('the Pixi bridge is not represented as a dynamic entry');
const [bridgeKey] = bridgePair;

const initialFiles = collectImportClosure(manifest, [entryKey]);
const optionalClosure = collectImportClosure(manifest, [bridgeKey], {
  includeDynamicImports: true,
});
const optionalExclusiveFiles = new Set(
  [...optionalClosure].filter((file) => !initialFiles.has(file))
);

for (const file of initialFiles) {
  if (OPTIONAL_MARKERS.some((marker) => file.includes(marker))) {
    fail(`optional renderer asset ${file} leaked into the initial import graph`);
  }
}
for (const marker of OPTIONAL_MARKERS) {
  const reference = htmlAssetReferences.find((asset) => asset.includes(marker));
  if (reference) fail(`index.html eagerly references optional renderer asset ${reference}`);
}

const entryBytes = bytesFor(entryChunk.file);
const initialBytes = totalBytes(initialFiles);
const optionalRendererBytes = totalBytes(optionalExclusiveFiles);
if (entryBytes > ENTRY_BUDGET_BYTES) {
  fail(`entry is ${entryBytes} bytes; budget is ${ENTRY_BUDGET_BYTES}`);
}
if (initialBytes > INITIAL_BUDGET_BYTES) {
  fail(`initial graph is ${initialBytes} bytes; budget is ${INITIAL_BUDGET_BYTES}`);
}
if (optionalRendererBytes > OPTIONAL_RENDERER_BUDGET_BYTES) {
  fail(
    `optional renderer graph is ${optionalRendererBytes} bytes; budget is ${OPTIONAL_RENDERER_BUDGET_BYTES}`
  );
}

console.info(
  JSON.stringify(
    {
      entry: { file: entryChunk.file, bytes: entryBytes, budget: ENTRY_BUDGET_BYTES },
      initial: {
        bytes: initialBytes,
        budget: INITIAL_BUDGET_BYTES,
        files: [...initialFiles].sort(),
      },
      optionalRenderer: {
        bytes: optionalRendererBytes,
        budget: OPTIONAL_RENDERER_BUDGET_BYTES,
        files: [...optionalExclusiveFiles].sort(),
      },
    },
    null,
    2
  )
);
console.info('Bundle budget passed: optional Pixi renderer is absent from the initial graph.');
