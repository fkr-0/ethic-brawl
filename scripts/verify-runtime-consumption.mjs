#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const auditRoots = [join(root, 'src'), join(root, 'tests'), join(root, 'e2e')];
const jsonOutput = process.argv.includes('--json');

const OFFICIAL_CAPABILITIES = Object.freeze([
  'core',
  'compute',
  'animation',
  'pixi',
  'testing',
  'sprites',
  'assets',
  'audio',
  'ui',
  'gameplay',
  'stages',
  'storage',
  'compat',
  'netcode',
  'tooling',
]);

// Runtime 1.12 now exposes every Ethic Brawl dependency through a capability
// subpath. Keep the root allowlist empty so future regressions fail closed.
const ROOT_IMPORT_EXCEPTIONS = new Set();

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectTypeScriptFiles(path)));
    else if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      files.push(path);
    }
  }
  return files.sort();
}

function parseNamedImportStatements(source) {
  const expression = /import\s+(?:type\s+)?\{([^;]*?)\}\s+from\s+['"]([^'"]+)['"]\s*;/g;
  const statements = [];
  for (const match of source.matchAll(expression)) {
    const body = match[1] ?? '';
    const specifier = match[2] ?? '';
    const imports = [];
    for (const rawPart of body.split(',')) {
      const part = rawPart
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/g, '')
        .trim()
        .replace(/^type\s+/, '');
      if (!part) continue;
      imports.push(part.split(/\s+as\s+/)[0]?.trim() ?? part);
    }
    statements.push({ specifier, imports });
  }
  return statements;
}

function parseCapabilityArray(source, label, violations) {
  const match = source.match(/const\s+arcadeRuntimeCapabilities\s*=\s*\[([\s\S]*?)\]\s*as const;/);
  if (!match) {
    violations.push(`${label} does not declare arcadeRuntimeCapabilities`);
    return [];
  }
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1]);
}

function sameMembers(left, right) {
  return left.length === right.length && left.every((entry) => right.includes(entry));
}

const sourceFiles = (
  await Promise.all(auditRoots.map((directory) => collectTypeScriptFiles(directory)))
)
  .flat()
  .sort();
const violations = [];
const capabilitiesUsed = new Set();
const rootImportSymbols = new Set();
let runtimeImportStatements = 0;
let rootImportStatements = 0;

for (const path of sourceFiles) {
  const source = await readFile(path, 'utf8');
  const displayPath = relative(root, path);

  const relativeRuntimeImports = [
    ...source.matchAll(/from\s+['"][^'"]*vendor\/arcade-runtime\.mjs['"]/g),
  ];
  if (relativeRuntimeImports.length > 0) {
    violations.push(`${displayPath} imports the vendored Runtime by relative path`);
  }

  const runtimeSpecifiers = [
    ...source.matchAll(/from\s+['"](@arcade\/runtime(?:\/[^'"]+)?)['"]/g),
  ].map((match) => match[1]);
  runtimeImportStatements += runtimeSpecifiers.length;

  for (const specifier of runtimeSpecifiers) {
    if (specifier === '@arcade/runtime') {
      rootImportStatements += 1;
      continue;
    }
    const capability = specifier.slice('@arcade/runtime/'.length);
    if (!OFFICIAL_CAPABILITIES.includes(capability)) {
      violations.push(`${displayPath} imports unknown Runtime capability ${specifier}`);
    } else {
      capabilitiesUsed.add(capability);
    }
  }

  const namedImportStatements = parseNamedImportStatements(source);
  const parsedRootStatements = namedImportStatements.filter(
    ({ specifier }) => specifier === '@arcade/runtime'
  );
  const parsedRootSymbols = parsedRootStatements.flatMap(({ imports }) => imports);
  const rootSpecifierCount = runtimeSpecifiers.filter(
    (specifier) => specifier === '@arcade/runtime'
  ).length;
  if (rootSpecifierCount !== parsedRootStatements.length) {
    violations.push(`${displayPath} uses an unsupported non-named Runtime root import`);
  }
  for (const symbol of parsedRootSymbols) {
    rootImportSymbols.add(symbol);
    if (!ROOT_IMPORT_EXCEPTIONS.has(symbol)) {
      violations.push(`${displayPath} imports non-allowlisted root symbol ${symbol}`);
    }
  }
}

const staleRootExceptions = [...ROOT_IMPORT_EXCEPTIONS]
  .filter((symbol) => !rootImportSymbols.has(symbol))
  .sort();
for (const symbol of staleRootExceptions) {
  violations.push(`root import exception is stale and should be removed: ${symbol}`);
}

const tsconfig = JSON.parse(await readFile(join(root, 'tsconfig.json'), 'utf8'));
const tsPaths = tsconfig.compilerOptions?.paths ?? {};
if (tsPaths['@arcade/runtime']?.[0] !== 'vendor/arcade-runtime.d.mts') {
  violations.push('tsconfig root Runtime alias must resolve to vendor/arcade-runtime.d.mts');
}
if (tsPaths['@arcade/runtime/*']?.[0] !== 'vendor/arcade-runtime.d.mts') {
  violations.push('tsconfig Runtime subpath alias must resolve to vendor/arcade-runtime.d.mts');
}

const viteSource = await readFile(join(root, 'vite.config.ts'), 'utf8');
const vitestSource = await readFile(join(root, 'vitest.config.ts'), 'utf8');
const viteCapabilities = parseCapabilityArray(viteSource, 'vite.config.ts', violations);
const vitestCapabilities = parseCapabilityArray(vitestSource, 'vitest.config.ts', violations);
if (!sameMembers(viteCapabilities, OFFICIAL_CAPABILITIES)) {
  violations.push(
    'vite.config.ts Runtime capability aliases differ from the official 1.12 export set'
  );
}
if (!sameMembers(vitestCapabilities, OFFICIAL_CAPABILITIES)) {
  violations.push(
    'vitest.config.ts Runtime capability aliases differ from the official 1.12 export set'
  );
}
if (!sameMembers(viteCapabilities, vitestCapabilities)) {
  violations.push('Vite and Vitest Runtime capability alias sets differ');
}
for (const capability of capabilitiesUsed) {
  if (!viteCapabilities.includes(capability) || !vitestCapabilities.includes(capability)) {
    violations.push(`used Runtime capability ${capability} is missing from a resolver alias set`);
  }
}

const metadata = JSON.parse(await readFile(join(root, 'vendor/arcade-runtime.meta.json'), 'utf8'));
const runtimeBytes = await readFile(join(root, 'vendor', metadata.module));
const runtimeTypes = await readFile(join(root, 'vendor', metadata.types));
const runtimeHash = createHash('sha256').update(runtimeBytes).digest('hex');
const typesHash = createHash('sha256').update(runtimeTypes).digest('hex');
if (runtimeHash !== metadata.sha256)
  violations.push('vendored Runtime module hash differs from metadata');
if (typesHash !== metadata.typesSha256)
  violations.push('vendored Runtime declarations hash differs from metadata');

const report = {
  runtimeVersion: metadata.version,
  sourceFiles: sourceFiles.length,
  runtimeImportStatements,
  rootImportStatements,
  rootImportSymbols: [...rootImportSymbols].sort(),
  staleRootExceptions,
  capabilitiesUsed: [...capabilitiesUsed].sort(),
  configuredCapabilities: [...viteCapabilities].sort(),
  violations,
};

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else if (violations.length === 0) {
  console.info(
    `Runtime ${metadata.version} consumption verified: ${runtimeImportStatements} imports, ` +
      `${capabilitiesUsed.size} capability subpaths, ${rootImportSymbols.size} allowlisted root exceptions.`
  );
} else {
  console.error(`Runtime consumption verification failed with ${violations.length} violation(s):`);
  for (const violation of violations) console.error(`- ${violation}`);
}

if (violations.length > 0) process.exitCode = 1;
