import type { AttackData } from './fighter-state';
import { resolveAttackHitPolicySource } from './hit-policy-presets';

export interface AttackContactRecord {
  hits: number;
  lastHitFrame: number;
}

export type AttackContactMap = Map<string, AttackContactRecord>;

export function resolveAttackHitPolicy(attack: Pick<AttackData, 'hitPolicy' | 'hitPolicyPreset'>) {
  return resolveAttackHitPolicySource(attack);
}

export function canRegisterAttackContact(
  attack: Pick<AttackData, 'hitPolicy' | 'hitPolicyPreset'>,
  contacts: AttackContactMap,
  targetId: string,
  currentFrame: number
): boolean {
  const record = contacts.get(targetId);
  if (!record) {
    return true;
  }

  const policy = resolveAttackHitPolicy(attack);
  if (record.hits >= policy.maxHitsPerTarget) {
    return false;
  }

  return currentFrame - record.lastHitFrame >= policy.rehitDelayFrames;
}

export function registerAttackContact(
  contacts: AttackContactMap,
  targetId: string,
  currentFrame: number
): void {
  const record = contacts.get(targetId);
  if (!record) {
    contacts.set(targetId, { hits: 1, lastHitFrame: currentFrame });
    return;
  }

  record.hits += 1;
  record.lastHitFrame = currentFrame;
}
