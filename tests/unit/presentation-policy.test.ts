import { createInitialAppShellState } from '@/app/app-shell/scene-factory';
import { resolveFightPresentationPolicy } from '@/app/presentation-policy';
import { describe, expect, it } from 'vitest';

describe('fight presentation policy', () => {
  it('maps accessibility preferences to renderer-neutral intensity scales', () => {
    const settings = createInitialAppShellState().settings;
    expect(resolveFightPresentationPolicy(settings)).toEqual({
      cameraEffectScale: 1,
      screenFeedbackScale: 1,
      fighterFlashScale: 1,
    });

    expect(
      resolveFightPresentationPolicy({
        ...settings,
        impactMotion: 'none',
        combatFlashes: 'reduced',
      })
    ).toEqual({
      cameraEffectScale: 0,
      screenFeedbackScale: 0.28,
      fighterFlashScale: 0.28,
    });
  });
});
