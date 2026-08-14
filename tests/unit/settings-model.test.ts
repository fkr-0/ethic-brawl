import {
  activateSettingsSelection,
  cycleSettingsTab,
  getSettingsRowCount,
  getSettingsRows,
} from '@/app/app-shell/settings-model';
import { createInitialAppShellState } from '@/app/app-shell/scene-factory';
import { describe, expect, it } from 'vitest';

describe('declarative settings model', () => {
  it('keeps interaction row counts aligned with rendered rows', () => {
    const settings = createInitialAppShellState().settings;
    expect(getSettingsRowCount(settings)).toBe(getSettingsRows(settings).length);
    const accessibility = cycleSettingsTab(settings, 'right');
    expect(accessibility.menuTab).toBe('accessibility');
    expect(getSettingsRowCount(accessibility)).toBe(getSettingsRows(accessibility).length);
  });

  it('cycles all tabs and resets transient selection state', () => {
    const settings = { ...createInitialAppShellState().settings, selectedIndex: 2 };
    const accessibility = cycleSettingsTab(settings, 'right');
    const keybindings = cycleSettingsTab(accessibility, 'right');
    const gameplay = cycleSettingsTab(keybindings, 'right');
    expect([accessibility.menuTab, keybindings.menuTab, gameplay.menuTab]).toEqual([
      'accessibility',
      'keybindings',
      'gameplay',
    ]);
    expect(accessibility.selectedIndex).toBe(0);
  });

  it('activates settings without mutating the previous snapshot', () => {
    const settings = createInitialAppShellState().settings;
    const next = activateSettingsSelection(settings);
    expect(next).not.toBe(settings);
    expect(next.skipStageIntro).toBe(true);
    expect(settings.skipStageIntro).toBe(false);
  });

  it('cycles spectator and accessibility density levels', () => {
    const base = createInitialAppShellState().settings;
    const spectator = activateSettingsSelection({ ...base, selectedIndex: 1 });
    expect(spectator.spectatorDetail).toBe('lab');
    const accessibility = cycleSettingsTab(base, 'right');
    const reducedMotion = activateSettingsSelection(accessibility);
    const reducedFlashes = activateSettingsSelection({ ...accessibility, selectedIndex: 1 });
    expect(reducedMotion.impactMotion).toBe('reduced');
    expect(reducedFlashes.combatFlashes).toBe('reduced');
  });
});
