import type {
  ItemPoseFamily,
  ItemVisualDefinition,
  ItemVisualFrameRole,
} from '@/game/items/item-visuals';

export type ItemVisualId =
  | 'rusted_short_sword'
  | 'neon_duelist_sword'
  | 'street_argument_bat'
  | 'civic_mace'
  | 'riot_breaker_mace'
  | 'pipe'
  | 'uzi'
  | 'bat'
  | 'katana'
  | 'molotov_cocktail'
  | 'grenade'
  | 'boulder'
  | 'rocket_launcher'
  | 'minidrone'
  | 'computer_terminal'
  | 'sniper_rifle'
  | 'bow'
  | 'foldable_chair'
  | 'shovel';

export const ITEM_VISUAL_FRAME_ROLES: readonly ItemVisualFrameRole[] = [
  'idle',
  'windup',
  'active',
  'recovery',
  'world',
  'thrown_or_fired',
  'impact_or_empty',
  'icon',
];

export const ITEM_VISUAL_SHEET_COLUMNS = 4;
export const ITEM_VISUAL_SHEET_ROWS = 2;
export const ITEM_VISUAL_FRAME_WIDTH = 96;
export const ITEM_VISUAL_FRAME_HEIGHT = 96;

export const ITEM_VISUAL_SPRITE_ROOT = '/assets/sprites/items';

const LIGHT_CARRY_AND_SWING = ['carry_light', 'swing_light', 'pickup_drop'] as const;
const THROWABLE = ['carry_light', 'throw_light', 'pickup_drop'] as const;
const TWO_HAND_RANGED = ['carry_heavy', 'aim_2h', 'shoot_2h', 'pickup_drop'] as const;

function sheetPath(id: string): string {
  return `${ITEM_VISUAL_SPRITE_ROOT}/${id}.png`;
}

function sheetVisual(
  itemId: ItemVisualId,
  options: Omit<ItemVisualDefinition, 'itemId' | 'asset'>
): ItemVisualDefinition {
  return {
    itemId,
    asset: {
      type: 'sheet',
      imagePath: sheetPath(itemId),
      columns: ITEM_VISUAL_SHEET_COLUMNS,
      rows: ITEM_VISUAL_SHEET_ROWS,
      frameWidth: ITEM_VISUAL_FRAME_WIDTH,
      frameHeight: ITEM_VISUAL_FRAME_HEIGHT,
      roles: ITEM_VISUAL_FRAME_ROLES,
    },
    ...options,
  };
}

export const ITEM_VISUALS: Record<ItemVisualId, ItemVisualDefinition> = {
  rusted_short_sword: sheetVisual('rusted_short_sword', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: ['carry_light', 'swing_light', 'pickup_drop'],
    transform: { pivot: { x: 18, y: 72 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -22 },
    vfxId: 'short_blade_arc',
  }),
  neon_duelist_sword: sheetVisual('neon_duelist_sword', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: ['carry_light', 'swing_light', 'pickup_drop'],
    transform: { pivot: { x: 16, y: 74 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -24 },
    vfxId: 'neon_blade_arc',
  }),
  street_argument_bat: sheetVisual('street_argument_bat', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: LIGHT_CARRY_AND_SWING,
    transform: { pivot: { x: 20, y: 70 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -18 },
    vfxId: 'blunt_swing_arc',
  }),
  civic_mace: sheetVisual('civic_mace', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: LIGHT_CARRY_AND_SWING,
    transform: { pivot: { x: 22, y: 68 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -16 },
    vfxId: 'heavy_blunt_arc',
  }),
  riot_breaker_mace: sheetVisual('riot_breaker_mace', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: LIGHT_CARRY_AND_SWING,
    transform: { pivot: { x: 24, y: 68 }, offset: { x: 0, y: 0 }, scale: 1.05, gripAngleDeg: -18 },
    vfxId: 'heavy_blunt_arc',
  }),
  pipe: sheetVisual('pipe', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: LIGHT_CARRY_AND_SWING,
    transform: { pivot: { x: 18, y: 70 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -18 },
    vfxId: 'metal_pipe_arc',
  }),
  uzi: sheetVisual('uzi', {
    kind: 'ranged_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: ['carry_light', 'shoot_1h', 'pickup_drop'],
    transform: { pivot: { x: 24, y: 54 }, offset: { x: 1, y: -1 }, scale: 1, gripAngleDeg: 0 },
    projectileId: 'small_bullet',
    vfxId: 'uzi_muzzle_flash',
  }),
  bat: sheetVisual('bat', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: LIGHT_CARRY_AND_SWING,
    transform: { pivot: { x: 20, y: 72 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -18 },
    vfxId: 'bat_swing_arc',
  }),
  katana: sheetVisual('katana', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: ['carry_light', 'swing_light', 'pickup_drop'],
    transform: { pivot: { x: 14, y: 78 }, offset: { x: 0, y: 0 }, scale: 1, gripAngleDeg: -28 },
    vfxId: 'katana_slash_arc',
  }),
  molotov_cocktail: sheetVisual('molotov_cocktail', {
    kind: 'throwable_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: THROWABLE,
    transform: { pivot: { x: 48, y: 66 }, offset: { x: 0, y: 0 }, scale: 0.9, gripAngleDeg: -8 },
    projectileId: 'molotov_bottle',
    vfxId: 'molotov_flame',
  }),
  grenade: sheetVisual('grenade', {
    kind: 'throwable_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: THROWABLE,
    transform: { pivot: { x: 48, y: 62 }, offset: { x: 0, y: 0 }, scale: 0.85, gripAngleDeg: 0 },
    projectileId: 'grenade_arc',
    vfxId: 'grenade_blink',
  }),
  boulder: sheetVisual('boulder', {
    kind: 'heavy_prop',
    defaultLayer: 'front_hand',
    anchor: 'both_hands',
    compatiblePoseFamilies: ['carry_heavy', 'throw_light', 'pickup_drop'],
    transform: { pivot: { x: 48, y: 62 }, offset: { x: 0, y: -8 }, scale: 1.2, gripAngleDeg: 0 },
    requiresCustomBodyPose: true,
    projectileId: 'boulder_throw',
    notes: 'Use boulder_carry_heavy and boulder_throw_body exceptions for polished hero frames.',
  }),
  rocket_launcher: sheetVisual('rocket_launcher', {
    kind: 'ranged_overlay',
    defaultLayer: 'front_hand',
    anchor: 'both_hands',
    compatiblePoseFamilies: ['carry_heavy', 'shoot_2h', 'pickup_drop'],
    transform: { pivot: { x: 22, y: 52 }, offset: { x: 0, y: -4 }, scale: 1.15, gripAngleDeg: 0 },
    twoHanded: true,
    requiresCustomBodyPose: true,
    projectileId: 'rocket',
    vfxId: 'rocket_muzzle_flash',
    notes: 'Use rocket_launcher_bracing body frames when available.',
  }),
  minidrone: sheetVisual('minidrone', {
    kind: 'deployable_actor',
    defaultLayer: 'actor',
    anchor: 'deploy_origin',
    compatiblePoseFamilies: ['deploy', 'pickup_drop'],
    transform: { pivot: { x: 48, y: 48 }, offset: { x: 18, y: -28 }, scale: 0.8, gripAngleDeg: 0 },
    projectileId: 'minidrone_actor',
    notes: 'After deploy, spawn this as its own actor instead of keeping it attached to the hand.',
  }),
  computer_terminal: sheetVisual('computer_terminal', {
    kind: 'tool_overlay',
    defaultLayer: 'front_hand',
    anchor: 'both_hands',
    compatiblePoseFamilies: ['carry_heavy', 'hack', 'deploy', 'smash_heavy', 'pickup_drop'],
    transform: { pivot: { x: 48, y: 56 }, offset: { x: 0, y: -3 }, scale: 1.1, gripAngleDeg: 0 },
    twoHanded: true,
    requiresCustomBodyPose: true,
    projectileId: 'low_orbit_ion_cannon_marker',
    vfxId: 'terminal_hack_pulse',
    notes: 'Multipurpose prop: hack held in both hands, deploy ion-cannon target, or smash as heavy object.',
  }),
  sniper_rifle: sheetVisual('sniper_rifle', {
    kind: 'ranged_overlay',
    defaultLayer: 'front_hand',
    anchor: 'both_hands',
    compatiblePoseFamilies: TWO_HAND_RANGED,
    transform: { pivot: { x: 18, y: 52 }, offset: { x: 1, y: -4 }, scale: 1.18, gripAngleDeg: 0 },
    twoHanded: true,
    requiresCustomBodyPose: true,
    projectileId: 'sniper_round',
    vfxId: 'sniper_muzzle_flash',
    notes: 'Use aim_2h for held aim; body exceptions recommended for clean shoulder bracing.',
  }),
  bow: sheetVisual('bow', {
    kind: 'ranged_overlay',
    defaultLayer: 'front_hand',
    anchor: 'both_hands',
    compatiblePoseFamilies: ['carry_light', 'aim_2h', 'shoot_2h', 'pickup_drop'],
    transform: { pivot: { x: 46, y: 54 }, offset: { x: 0, y: -3 }, scale: 1, gripAngleDeg: 0 },
    twoHanded: true,
    requiresCustomBodyPose: true,
    projectileId: 'arrow',
    vfxId: 'bow_release_snap',
    notes: 'Needs a draw-string body pose for best readability; overlay still supports rough prototyping.',
  }),
  foldable_chair: sheetVisual('foldable_chair', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'both_hands',
    compatiblePoseFamilies: ['carry_heavy', 'swing_light', 'smash_heavy', 'pickup_drop'],
    transform: { pivot: { x: 42, y: 64 }, offset: { x: 0, y: -2 }, scale: 1.08, gripAngleDeg: -8 },
    twoHanded: true,
    projectileId: 'chair_splinter',
    vfxId: 'chair_smash_burst',
    notes: 'Can be swung as comedy melee or used as a two-hand smash prop.',
  }),
  shovel: sheetVisual('shovel', {
    kind: 'melee_overlay',
    defaultLayer: 'front_hand',
    anchor: 'right_hand',
    compatiblePoseFamilies: ['carry_light', 'swing_light', 'smash_heavy', 'pickup_drop'],
    transform: { pivot: { x: 20, y: 76 }, offset: { x: 0, y: 0 }, scale: 1.05, gripAngleDeg: -20 },
    vfxId: 'shovel_dirt_spark',
    notes: 'Long melee tool with optional ground-hit VFX.',
  }),
};

export const CUSTOM_BODY_POSE_SPRITES = [
  'rocket_launcher_bracing.png',
  'rocket_launcher_fire.png',
  'boulder_carry_heavy.png',
  'boulder_throw_body.png',
  'katana_signature_flourish.png',
  'computer_terminal_hack.png',
  'computer_terminal_ion_cannon_deploy.png',
  'computer_terminal_smash.png',
  'sniper_rifle_bracing.png',
  'bow_draw.png',
  'foldable_chair_smash.png',
] as const;

export function getItemVisual(itemId: string): ItemVisualDefinition | null {
  return ITEM_VISUALS[itemId as ItemVisualId] ?? null;
}

export function getItemVisualsByPoseFamily(poseFamily: ItemPoseFamily): ItemVisualDefinition[] {
  return Object.values(ITEM_VISUALS).filter((visual) =>
    visual.compatiblePoseFamilies.includes(poseFamily)
  );
}

export function getItemVisualsRequiringCustomBodyPose(): ItemVisualDefinition[] {
  return Object.values(ITEM_VISUALS).filter((visual) => visual.requiresCustomBodyPose === true);
}
