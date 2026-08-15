import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_ROOT = process.cwd();

const ACTION_SUFFIXES = {
  normal_attacks: 'normal_attacks_4x4.png',
  mobility_throw: 'mobility_throw_4x4.png',
  item_interactions: 'item_interactions_4x4.png',
  advanced_guard: 'advanced_guard_4x4.png',
  damage_recovery: 'damage_recovery_4x4.png',
  specials: 'specials_4x4.png',
  special_effects: 'special_effects_4x4.png',
  intro_taunt_victory_defeat: 'intro_taunt_victory_defeat_4x4.png',
};

function unique(values) {
  return [...new Set(values)].sort();
}

function read(root, path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function fighterAssets(root) {
  const source = read(root, 'src/render/sprites/sprite-integration.ts');
  const direct = unique(source.match(/assets\/sprites\/roster\/[^'"`]+\.png/g) ?? []);
  const expanded = [];
  for (const match of source.matchAll(/authoredActionSheets\('([^']+)',\s*\[(.*?)\]\)/gs)) {
    const characterId = match[1];
    const kinds = [...match[2].matchAll(/'([^']+)'/g)].map((value) => value[1]);
    for (const kind of kinds) {
      const suffix = ACTION_SUFFIXES[kind];
      if (!suffix) throw new Error(`Unknown authored action sheet kind: ${kind}`);
      expanded.push(
        `assets/sprites/roster/${characterId}/source/animation-v2/${characterId}_${suffix}`
      );
    }
  }
  return unique([...direct, ...expanded]).map((path) => {
    const sourceContract = path.includes('/animation-v2/') ? 'animation-v2' : 'legacy-roster';
    return {
      path,
      category: 'fighter',
      required: true,
      grid: { columns: 4, rows: 4 },
      sourceContract,
      expected:
        sourceContract === 'animation-v2'
          ? { width: 1024, height: 1024 }
          : { normalizedWidth: 512, normalizedHeight: 512, acceptedSquareWidths: [384, 512] },
    };
  });
}

function itemAssets(root) {
  const source = read(root, 'src/content/items/item-visual-data.ts');
  const itemIds = [...source.matchAll(/^\s{2}([a-z0-9_]+):\s*sheetVisual\(/gm)].map(
    (match) => match[1]
  );
  const customBlock = source.slice(source.indexOf('CUSTOM_BODY_POSE_SPRITES'));
  const bodyPoses = [...customBlock.matchAll(/'([^']+\.png)'/g)].map((match) => match[1]);
  return [
    ...unique(itemIds).map((id) => ({
      path: `assets/sprites/items/${id}.png`,
      category: 'item-overlay',
      // Item overlays have a complete render-job corpus, but the current game
      // does not call item-overlay-renderer yet. Keep them in the audit/backlog
      // without making an unrelated fighter release fail on not-yet-integrated
      // art. Flip this to true when the renderer is wired into gameplay.
      required: false,
      grid: { columns: 4, rows: 2 },
      expected: { width: 384, height: 192 },
    })),
    ...unique(bodyPoses).map((name) => ({
      path: `assets/sprites/items/${name}`,
      category: 'item-body-pose',
      // These are explicitly polish exceptions ("when available" / body-pose
      // recommendations) and are not consumed by runtime code today.
      required: false,
      grid: { columns: 1, rows: 1 },
      expected: { width: 256, height: 256 },
    })),
  ];
}

function enemyAssets(root) {
  const source = read(root, 'src/content/enemies/enemy-visual-data.ts');
  const atlases = unique(
    [...source.matchAll(/'((?:street|crowd|machines-apocalypse))'/g)].map((match) => match[1])
  );
  return atlases.map((atlas) => ({
    path: `assets/sprites/enemies/${atlas}.png`,
    category: 'enemy',
    required: true,
    grid: { columns: 4, rows: 4 },
    expected: { width: 512, height: 512 },
  }));
}

function itemIconAssets(root) {
  const source = read(root, 'src/content/items/item-icon-data.ts');
  const block = source.slice(source.indexOf('ITEM_ICON_IDS'), source.indexOf('] as const'));
  const count = [...block.matchAll(/'([^']+)'/g)].length;
  const sheetCount = Math.ceil(count / 16);
  if (sheetCount < 1) throw new Error('No item icon IDs found');
  return Array.from({ length: sheetCount }, (_, index) => ({
    path: `assets/sprites/items/icons-${index + 1}.png`,
    category: 'item-icons',
    required: true,
    requiredFrames: Math.min(16, count - index * 16),
    grid: { columns: 4, rows: 4 },
    expected: { width: 512, height: 512 },
  }));
}

export function collectRuntimeSpriteAssets(projectRoot = DEFAULT_ROOT) {
  const assets = [
    ...fighterAssets(projectRoot),
    ...itemAssets(projectRoot),
    ...enemyAssets(projectRoot),
    ...itemIconAssets(projectRoot),
  ];
  const byPath = new Map();
  for (const asset of assets) {
    const existing = byPath.get(asset.path);
    if (existing && JSON.stringify(existing) !== JSON.stringify(asset)) {
      throw new Error(`Conflicting sprite declarations for ${asset.path}`);
    }
    byPath.set(asset.path, asset);
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

if (process.argv[1]?.endsWith('sprite-asset-catalog.mjs')) {
  const projectRoot = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_ROOT;
  const assets = collectRuntimeSpriteAssets(projectRoot);
  process.stdout.write(
    `${JSON.stringify({ projectRoot, count: assets.length, assets }, null, 2)}\n`
  );
}
