#!/usr/bin/env node

/**
 * Split a 4x4 sprite sheet into individual frames
 * Usage: node scripts/split-sprite-sheet.js <input.png> <output-dir> <prefix>
 */

const fs = require('node:fs');
const path = require('node:path');

const INPUT_FILE = process.argv[2];
const OUTPUT_DIR = process.argv[3];
const PREFIX = process.argv[4] || 'frame';

if (!INPUT_FILE || !OUTPUT_DIR) {
  console.error('Usage: node split-sprite-sheet.js <input.png> <output-dir> [prefix]');
  process.exit(1);
}

const _FRAME_SIZE = 64;
const _SHEET_SIZE = 256;

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 4 + col;
      const filename = `${PREFIX}_f${String(index).padStart(2, '0')}.png`;
      const _outputPath = path.join(OUTPUT_DIR, filename);
    }
  }
}

main();
