import type { AttackData } from './fighter-state';
import { resolveAttackHitPolicySource } from './hit-policy-presets';
import { createHitContactLedger, type HitContactLedger } from '../../../vendor/arcade-runtime.mjs';

export interface AttackContactRecord {
  hits: number;
  lastHitFrame: number;
}

export type AttackContactMap = HitContactLedger;

export function createAttackContactMap(): AttackContactMap {
  return createHitContactLedger();
}

export function resolveAttackHitPolicy(attack: Pick<AttackData, 'hitPolicy' | 'hitPolicyPreset'>) {
  return resolveAttackHitPolicySource(attack);
}

export function canRegisterAttackContact(
  attack: Pick<AttackData, 'hitPolicy' | 'hitPolicyPreset'>,
  contacts: AttackContactMap,
  targetId: string,
  currentFrame: number
): boolean {
  const policy = resolveAttackHitPolicy(attack);
  return contacts.canRegister(targetId, currentFrame, {
    maxHitsPerTarget: policy.maxHitsPerTarget,
    rehitDelayFrames: policy.rehitDelayFrames,
  });
}

export function registerAttackContact(
  contacts: AttackContactMap,
  targetId: string,
  currentFrame: number
): void {
  contacts.register(targetId, currentFrame);
}
