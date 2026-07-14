import {
  CUSTOM_BODY_POSE_SPRITES,
  getItem,
  getItemVisual,
  getItemVisualsByPoseFamily,
  getItemVisualsRequiringCustomBodyPose,
} from '@/content/items';
import {
  getDefaultItemVisualFrameRole,
  isItemVisualCompatibleWithPose,
  resolveItemVisualFrame,
} from '@/game/items';
import { describe, expect, it } from 'vitest';

describe('item visual definitions', () => {
  it('maps every newly requested item to a render visual', () => {
    const ids = [
      'pipe',
      'uzi',
      'bat',
      'katana',
      'molotov_cocktail',
      'grenade',
      'boulder',
      'rocket_launcher',
      'minidrone',
      'computer_terminal',
      'sniper_rifle',
      'bow',
      'foldable_chair',
      'shovel',
    ] as const;

    for (const id of ids) {
      expect(getItem(id).id).toBe(id);
      expect(getItemVisual(id)?.itemId).toBe(id);
    }
  });

  it('resolves sheet frames by role', () => {
    const visual = getItemVisual('katana');
    if (!visual) {
      throw new Error('Expected katana visual');
    }

    const frame = resolveItemVisualFrame(visual, 'active');

    expect(frame).toEqual(
      expect.objectContaining({
        imagePath: 'assets/sprites/items/katana.png',
        sourceX: 192,
        sourceY: 0,
        sourceWidth: 96,
        sourceHeight: 96,
        role: 'active',
      })
    );
  });

  it('knows the default frame role for pose families', () => {
    expect(getDefaultItemVisualFrameRole('carry_light')).toBe('idle');
    expect(getDefaultItemVisualFrameRole('swing_light')).toBe('active');
    expect(getDefaultItemVisualFrameRole('pickup_drop')).toBe('world');
  });

  it('groups visuals by pose family', () => {
    const throwableIds = getItemVisualsByPoseFamily('throw_light').map((visual) => visual.itemId);
    expect(throwableIds).toEqual(
      expect.arrayContaining(['molotov_cocktail', 'grenade', 'boulder'])
    );

    const uzi = getItemVisual('uzi');
    if (!uzi) {
      throw new Error('Expected uzi visual');
    }
    expect(isItemVisualCompatibleWithPose(uzi, 'shoot_1h')).toBe(true);
    expect(isItemVisualCompatibleWithPose(uzi, 'shoot_2h')).toBe(false);

    const terminal = getItemVisual('computer_terminal');
    if (!terminal) {
      throw new Error('Expected terminal visual');
    }
    expect(isItemVisualCompatibleWithPose(terminal, 'hack')).toBe(true);
    expect(isItemVisualCompatibleWithPose(terminal, 'smash_heavy')).toBe(true);

    const sniper = getItemVisual('sniper_rifle');
    if (!sniper) {
      throw new Error('Expected sniper visual');
    }
    expect(isItemVisualCompatibleWithPose(sniper, 'aim_2h')).toBe(true);
  });

  it('flags the item visuals that need bespoke body poses', () => {
    expect(getItemVisualsRequiringCustomBodyPose().map((visual) => visual.itemId)).toEqual(
      expect.arrayContaining([
        'boulder',
        'rocket_launcher',
        'computer_terminal',
        'sniper_rifle',
        'bow',
      ])
    );
    expect(CUSTOM_BODY_POSE_SPRITES).toEqual(
      expect.arrayContaining([
        'rocket_launcher_bracing.png',
        'boulder_carry_heavy.png',
        'computer_terminal_hack.png',
        'sniper_rifle_bracing.png',
        'bow_draw.png',
      ])
    );
  });
});
