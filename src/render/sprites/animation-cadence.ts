const LOCOMOTION_CLIPS = new Set(['idle', 'run']);

export function resolveAnimationPlaybackTarget(state: string, locomotionSpeed: number): number {
  const speed = Number.isFinite(locomotionSpeed) ? Math.max(0, locomotionSpeed) : 0;

  switch (state) {
    case 'idle':
      return 0.82;
    case 'walking':
      return Math.max(0.72, Math.min(0.98, 0.68 + speed * 0.045));
    case 'running':
      return Math.max(0.94, Math.min(1.28, 0.86 + speed * 0.055));
    default:
      return 1;
  }
}

export function smoothAnimationPlaybackSpeed(
  current: number,
  target: number,
  response = 0.2
): number {
  const safeCurrent = Number.isFinite(current) ? Math.max(0.05, current) : 1;
  const safeTarget = Number.isFinite(target) ? Math.max(0.05, target) : 1;
  const safeResponse = Number.isFinite(response) ? Math.max(0, Math.min(1, response)) : 0.2;
  const next = safeCurrent + (safeTarget - safeCurrent) * safeResponse;
  return Math.abs(next - safeTarget) < 0.001 ? safeTarget : next;
}

export function shouldRestartAnimationClip(
  currentClipId: string | null,
  targetClipId: string
): boolean {
  return currentClipId !== targetClipId;
}

export function resolveClipTransitionFrames(previousClipId: string, nextClipId: string): number {
  return LOCOMOTION_CLIPS.has(previousClipId) && LOCOMOTION_CLIPS.has(nextClipId) ? 7 : 4;
}
