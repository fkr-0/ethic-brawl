import type { ItemDefinition } from './item-system';

export type ItemVisualKind =
  | 'melee_overlay'
  | 'ranged_overlay'
  | 'throwable_overlay'
  | 'heavy_prop'
  | 'deployable_actor'
  | 'tool_overlay';

export type ItemRenderLayer = 'behind_body' | 'front_hand' | 'hand_cover' | 'vfx' | 'actor';

export type ItemAnchorId =
  | 'right_hand'
  | 'left_hand'
  | 'both_hands'
  | 'throw_origin'
  | 'muzzle_origin'
  | 'deploy_origin'
  | 'torso';

export type ItemPoseFamily =
  | 'carry_light'
  | 'carry_heavy'
  | 'swing_light'
  | 'throw_light'
  | 'shoot_1h'
  | 'shoot_2h'
  | 'aim_2h'
  | 'hack'
  | 'smash_heavy'
  | 'deploy'
  | 'pickup_drop';

export type ItemVisualFrameRole =
  | 'idle'
  | 'windup'
  | 'active'
  | 'recovery'
  | 'world'
  | 'thrown_or_fired'
  | 'impact_or_empty'
  | 'icon';

export interface ItemVisualPoint {
  x: number;
  y: number;
}

export interface ItemVisualTransform {
  pivot: ItemVisualPoint;
  offset: ItemVisualPoint;
  scale: number;
  gripAngleDeg: number;
}

export interface ItemVisualSpriteSheet {
  type: 'sheet';
  imagePath: string;
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  roles: readonly ItemVisualFrameRole[];
}

export interface ItemVisualSingleFrameSet {
  type: 'single_pngs';
  framePaths: Partial<Record<ItemVisualFrameRole, string>>;
}

export type ItemVisualAsset = ItemVisualSpriteSheet | ItemVisualSingleFrameSet;

export interface ItemVisualDefinition {
  itemId: string;
  kind: ItemVisualKind;
  asset: ItemVisualAsset;
  defaultLayer: ItemRenderLayer;
  anchor: ItemAnchorId;
  compatiblePoseFamilies: readonly ItemPoseFamily[];
  transform: ItemVisualTransform;
  twoHanded?: boolean;
  requiresCustomBodyPose?: boolean;
  projectileId?: string;
  vfxId?: string;
  notes?: string;
}

export interface FrameAnchorTransform {
  x: number;
  y: number;
  angleDeg: number;
  behindBody?: boolean;
}

export type ItemFrameAnchors = Partial<Record<ItemAnchorId, FrameAnchorTransform>>;

export interface CharacterItemAnchorFrame {
  frameLabel: string;
  anchors: ItemFrameAnchors;
}

export interface CharacterItemAnchorProfile {
  characterId: string;
  frames: readonly CharacterItemAnchorFrame[];
}

export interface ResolvedItemVisualFrame {
  imagePath: string;
  sourceX: number;
  sourceY: number;
  sourceWidth: number | null;
  sourceHeight: number | null;
  role: ItemVisualFrameRole;
}

export function getDefaultItemVisualFrameRole(poseFamily: ItemPoseFamily): ItemVisualFrameRole {
  switch (poseFamily) {
    case 'swing_light':
    case 'throw_light':
    case 'shoot_1h':
    case 'shoot_2h':
    case 'aim_2h':
    case 'hack':
    case 'smash_heavy':
    case 'deploy':
      return 'active';
    case 'pickup_drop':
      return 'world';
    case 'carry_light':
    case 'carry_heavy':
      return 'idle';
  }
}

export function getPrimaryPoseFamily(visual: ItemVisualDefinition): ItemPoseFamily {
  return visual.compatiblePoseFamilies[0] ?? 'carry_light';
}

export function resolveItemVisualFrame(
  visual: ItemVisualDefinition,
  role = getDefaultItemVisualFrameRole(getPrimaryPoseFamily(visual))
): ResolvedItemVisualFrame | null {
  if (visual.asset.type === 'single_pngs') {
    const imagePath = visual.asset.framePaths[role] ?? visual.asset.framePaths.idle;
    if (!imagePath) {
      return null;
    }

    return {
      imagePath,
      sourceX: 0,
      sourceY: 0,
      sourceWidth: null,
      sourceHeight: null,
      role,
    };
  }

  const frameIndex = visual.asset.roles.indexOf(role);
  if (frameIndex < 0) {
    return null;
  }

  const column = frameIndex % visual.asset.columns;
  const row = Math.floor(frameIndex / visual.asset.columns);

  return {
    imagePath: visual.asset.imagePath,
    sourceX: column * visual.asset.frameWidth,
    sourceY: row * visual.asset.frameHeight,
    sourceWidth: visual.asset.frameWidth,
    sourceHeight: visual.asset.frameHeight,
    role,
  };
}

export function isItemVisualCompatibleWithPose(
  visual: ItemVisualDefinition,
  poseFamily: ItemPoseFamily
): boolean {
  return visual.compatiblePoseFamilies.includes(poseFamily);
}

export function getItemVisualAnchor(visual: ItemVisualDefinition): ItemAnchorId {
  return visual.anchor;
}

export function shouldRenderItemBehindBody(
  visual: ItemVisualDefinition,
  frameAnchors?: ItemFrameAnchors
): boolean {
  const anchor = frameAnchors?.[visual.anchor];
  return anchor?.behindBody ?? visual.defaultLayer === 'behind_body';
}

export function isVisualItem(item: ItemDefinition, visual: ItemVisualDefinition): boolean {
  return item.id === visual.itemId;
}
