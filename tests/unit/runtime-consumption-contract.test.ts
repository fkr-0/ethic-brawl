import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

interface RuntimeConsumptionReport {
  runtimeVersion: string;
  sourceFiles: number;
  runtimeImportStatements: number;
  rootImportStatements: number;
  rootImportSymbols: string[];
  staleRootExceptions: string[];
  capabilitiesUsed: string[];
  configuredCapabilities: string[];
  violations: string[];
}

describe('Runtime consumption contract', () => {
  it('keeps the vendored Runtime on official capability subpaths with no root imports', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/verify-runtime-consumption.mjs', '--json'],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
      }
    );
    const report = JSON.parse(output) as RuntimeConsumptionReport;

    expect(report.runtimeVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(report.sourceFiles).toBeGreaterThan(100);
    expect(report.runtimeImportStatements).toBeGreaterThan(0);
    expect(report.capabilitiesUsed).toEqual(
      expect.arrayContaining([
        'animation',
        'core',
        'gameplay',
        'pixi',
        'sprites',
        'stages',
        'testing',
        'tooling',
        'ui',
      ])
    );
    expect(report.configuredCapabilities).toEqual(expect.arrayContaining(report.capabilitiesUsed));
    expect(report.rootImportStatements).toBe(0);
    expect(report.rootImportSymbols).toEqual([]);
    expect(report.staleRootExceptions).toEqual([]);
    expect(report.violations).toEqual([]);
  });
});
