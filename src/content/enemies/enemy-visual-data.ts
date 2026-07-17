import type { EnemyArchetypeId } from '@/content/stages/story-stage-data';

export type EnemyAnimationRole = 'idle' | 'advance' | 'attack' | 'hurt';

export interface EnemyVisualDefinition {
  id: EnemyArchetypeId;
  label: string;
  atlasPath: string;
  atlasRow: 0 | 1 | 2 | 3;
  frameRoles: readonly EnemyAnimationRole[];
  accent: string;
  silhouette: 'light' | 'medium' | 'heavy' | 'aerial';
}

const FRAME_ROLES = ['idle', 'advance', 'attack', 'hurt'] as const;
const ROOT = 'assets/sprites/enemies';

function enemy(
  id: EnemyArchetypeId,
  label: string,
  atlas: 'street' | 'crowd' | 'machines-apocalypse',
  atlasRow: 0 | 1 | 2 | 3,
  accent: string,
  silhouette: EnemyVisualDefinition['silhouette']
): EnemyVisualDefinition {
  return {
    id,
    label,
    atlasPath: `${ROOT}/${atlas}.png`,
    atlasRow,
    frameRoles: FRAME_ROLES,
    accent,
    silhouette,
  };
}

export const ENEMY_VISUALS: Record<EnemyArchetypeId, EnemyVisualDefinition> = {
  thug_1: enemy('thug_1', 'Market Heavy', 'street', 0, '#E39042', 'medium'),
  thug_2: enemy('thug_2', 'Debt Collector', 'street', 1, '#D56B46', 'medium'),
  thug_3: enemy('thug_3', 'Archive Bruiser', 'street', 2, '#B84B5E', 'heavy'),
  massive_thug: enemy('massive_thug', 'Ziggurat Gate', 'street', 3, '#FF9F1C', 'heavy'),
  ninja: enemy('ninja', 'Courier Ninja', 'crowd', 0, '#A778FF', 'light'),
  ninja_mob: enemy('ninja_mob', 'Courier Cell', 'crowd', 1, '#D45CFF', 'light'),
  citizen_1: enemy('citizen_1', 'Market Citizen', 'crowd', 2, '#56D6C9', 'medium'),
  citizen_riot: enemy('citizen_riot', 'Riot Citizen', 'crowd', 3, '#FF5B67', 'medium'),
  air_drone: enemy(
    'air_drone',
    'Cuneiform Air Drone',
    'machines-apocalypse',
    0,
    '#00F5FF',
    'aerial'
  ),
  ground_drone: enemy(
    'ground_drone',
    'Bronze Ground Drone',
    'machines-apocalypse',
    1,
    '#39FF14',
    'medium'
  ),
  zombified_citizen: enemy(
    'zombified_citizen',
    'Ashwalker',
    'machines-apocalypse',
    2,
    '#A9C56D',
    'medium'
  ),
  postapocalypse_heavy_evolutionary_selection_citizen: enemy(
    'postapocalypse_heavy_evolutionary_selection_citizen',
    'Selection Heavy',
    'machines-apocalypse',
    3,
    '#FF7A45',
    'heavy'
  ),
};

export function getEnemyVisual(id: string): EnemyVisualDefinition | null {
  return ENEMY_VISUALS[id as EnemyArchetypeId] ?? null;
}

export function getEnemyAtlasFrameIndex(id: EnemyArchetypeId, role: EnemyAnimationRole): number {
  const visual = ENEMY_VISUALS[id];
  const column = visual.frameRoles.indexOf(role);
  return visual.atlasRow * 4 + Math.max(0, column);
}
