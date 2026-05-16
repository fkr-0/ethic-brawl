export interface AttackHitPolicy {
  maxHitsPerTarget?: number;
  rehitDelayFrames?: number;
}

export type AttackHitPolicyPresetId = 'single' | 'double_tap' | 'pressure_flurry';

export interface AttackHitPolicyPreset extends Required<AttackHitPolicy> {
  id: AttackHitPolicyPresetId;
  label: string;
  description: string;
}

export const ATTACK_HIT_POLICY_PRESETS: Record<AttackHitPolicyPresetId, AttackHitPolicyPreset> = {
  single: {
    id: 'single',
    label: 'Single Confirm',
    description: 'One contact per target during the active window.',
    maxHitsPerTarget: 1,
    rehitDelayFrames: 0,
  },
  double_tap: {
    id: 'double_tap',
    label: 'Double Tap',
    description: 'Allows a second confirm after a short gap.',
    maxHitsPerTarget: 2,
    rehitDelayFrames: 2,
  },
  pressure_flurry: {
    id: 'pressure_flurry',
    label: 'Pressure Flurry',
    description: 'Sustained close-range pressure with authored reconnect timing.',
    maxHitsPerTarget: 3,
    rehitDelayFrames: 3,
  },
};

const DEFAULT_ATTACK_HIT_POLICY: Required<AttackHitPolicy> = {
  maxHitsPerTarget: 1,
  rehitDelayFrames: 0,
};

export interface AttackHitPolicySource {
  hitPolicy?: AttackHitPolicy;
  hitPolicyPreset?: AttackHitPolicyPresetId;
}

export function getAttackHitPolicyPreset(
  presetId?: AttackHitPolicyPresetId
): AttackHitPolicyPreset | null {
  if (!presetId) {
    return null;
  }

  return ATTACK_HIT_POLICY_PRESETS[presetId] ?? null;
}

export function resolveAttackHitPolicySource(
  source: AttackHitPolicySource
): Required<AttackHitPolicy> {
  const preset = getAttackHitPolicyPreset(source.hitPolicyPreset);

  return {
    maxHitsPerTarget:
      source.hitPolicy?.maxHitsPerTarget ??
      preset?.maxHitsPerTarget ??
      DEFAULT_ATTACK_HIT_POLICY.maxHitsPerTarget,
    rehitDelayFrames:
      source.hitPolicy?.rehitDelayFrames ??
      preset?.rehitDelayFrames ??
      DEFAULT_ATTACK_HIT_POLICY.rehitDelayFrames,
  };
}
