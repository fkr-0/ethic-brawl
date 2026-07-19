import { describe, expect, it } from 'vitest';
import {
  resolveAnimationPlaybackTarget,
  resolveClipTransitionFrames,
  shouldRestartAnimationClip,
  smoothAnimationPlaybackSpeed,
} from '@/render/sprites/animation-cadence';
import {
  createAnimationPlayerState,
  isAnimationComplete,
  playClip,
  setPlaybackSpeed,
  updateAnimationPlayer,
} from '@/render/sprites/animation-player';
import { createClip } from '@/render/sprites/sprite-assets';

describe('sprite animation cadence', () => {
  it('keeps walking and running on one continuous locomotion clip', () => {
    expect(shouldRestartAnimationClip('run', 'run')).toBe(false);
    expect(shouldRestartAnimationClip('idle', 'run')).toBe(true);
    expect(resolveClipTransitionFrames('idle', 'run')).toBe(7);
    expect(resolveClipTransitionFrames('run', 'idle')).toBe(7);
    expect(resolveClipTransitionFrames('run', 'attack_light_startup')).toBe(4);
  });

  it('uses readable bounded locomotion rates instead of frame-chattering speeds', () => {
    expect(resolveAnimationPlaybackTarget('idle', 0)).toBe(0.82);
    expect(resolveAnimationPlaybackTarget('walking', 0)).toBe(0.72);
    expect(resolveAnimationPlaybackTarget('walking', 20)).toBe(0.98);
    expect(resolveAnimationPlaybackTarget('running', 0)).toBe(0.94);
    expect(resolveAnimationPlaybackTarget('running', 20)).toBe(1.28);
  });

  it('approaches cadence changes gradually without overshooting', () => {
    const first = smoothAnimationPlaybackSpeed(0.72, 1.28);
    const second = smoothAnimationPlaybackSpeed(first, 1.28);
    expect(first).toBeGreaterThan(0.72);
    expect(first).toBeLessThan(1.28);
    expect(second).toBeGreaterThan(first);
    expect(second).toBeLessThanOrEqual(1.28);
  });

  it('changes locomotion speed without resetting the current pose or timer', () => {
    const clip = createClip('run', 'Run', [4, 5, 6, 7], 'loop', 5);
    let state = playClip(createAnimationPlayerState(), clip, 0.72);
    state = updateAnimationPlayer(state, 7);
    const frameBefore = state.currentFrame;
    const timerBefore = state.frameTimer;

    state = setPlaybackSpeed(state, 1.05);

    expect(state.currentFrame).toBe(frameBefore);
    expect(state.frameTimer).toBe(timerBefore);
    expect(state.playbackSpeed).toBe(1.05);
  });

  it('retains a completed once clip on its final frame', () => {
    const clip = createClip('hit', 'Hit', [8, 9, 10], 'once', 2);
    let state = playClip(createAnimationPlayerState(), clip);
    state = updateAnimationPlayer(state, 7);

    expect(state.currentFrame).toBe(2);
    expect(state.isPlaying).toBe(false);
    expect(isAnimationComplete(state)).toBe(true);
  });
});
