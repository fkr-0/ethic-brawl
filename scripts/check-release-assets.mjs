#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const releaseRoster = [
  'camus',
  'machiavelli',
  'diogenes',
  'leibniz',
  'foucault',
  'deleuze_guattari',
  'marx',
  'bakunin',
  'schmitt',
  'socrates',
  'kant',
  'kierkegaard',
  'stirner',
];

const requiredAssets = [
  ...releaseRoster.flatMap((id) => [
    `public/assets/sprites/roster/${id}/source/${id}_core_4x4.png`,
    `public/assets/sprites/roster/${id}/source/${id}_extended_4x4.png`,
  ]),
  'public/assets/sprites/enemies/street.png',
  'public/assets/sprites/enemies/crowd.png',
  'public/assets/sprites/enemies/machines-apocalypse.png',
  'public/assets/sprites/items/icons-1.png',
  'public/assets/sprites/items/icons-2.png',
];

function readPngDimensions(path) {
  const bytes = readFileSync(resolve(path));
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    throw new Error(`${path} is not a PNG`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

for (const path of requiredAssets) {
  const { width, height } = readPngDimensions(path);
  if (width < 512 || height < 512) {
    throw new Error(`${path} is ${width}×${height}; release atlases must be at least 512×512`);
  }
}

console.info(`Release asset gate passed for ${requiredAssets.length} production atlases.`);
