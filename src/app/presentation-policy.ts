import type { SettingsState } from '@/app/app-shell/types';
import type { FightPresentationOptions } from '@/render/fight-presentation';

export interface FightPresentationPolicy {
  cameraEffectScale: number;
  screenFeedbackScale: number;
  fighterFlashScale: number;
}

const IMPACT_MOTION_SCALE = {
  full: 1,
  reduced: 0.35,
  none: 0,
} as const;

const COMBAT_FLASH_SCALE = {
  full: 1,
  reduced: 0.28,
  none: 0,
} as const;

export const DEFAULT_FIGHT_PRESENTATION_POLICY: FightPresentationPolicy = {
  cameraEffectScale: 1,
  screenFeedbackScale: 1,
  fighterFlashScale: 1,
};

export function resolveFightPresentationPolicy(settings: SettingsState): FightPresentationPolicy {
  const flashScale = COMBAT_FLASH_SCALE[settings.combatFlashes];
  return {
    cameraEffectScale: IMPACT_MOTION_SCALE[settings.impactMotion],
    screenFeedbackScale: flashScale,
    fighterFlashScale: flashScale,
  };
}

export function presentationPolicyToRenderOptions(
  policy: FightPresentationPolicy
): Pick<FightPresentationOptions, 'screenFeedbackScale' | 'fighterFlashScale'> {
  return {
    screenFeedbackScale: policy.screenFeedbackScale,
    fighterFlashScale: policy.fighterFlashScale,
  };
}
