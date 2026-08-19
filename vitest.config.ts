import path from 'node:path';
import { defineConfig } from 'vitest/config';

const arcadeRuntimeModule = path.resolve(__dirname, './vendor/arcade-runtime.mjs');
const arcadeRuntimeCapabilities = [
  'core',
  'compute',
  'animation',
  'pixi',
  'testing',
  'sprites',
  'assets',
  'audio',
  'ui',
  'gameplay',
  'stages',
  'storage',
  'compat',
  'netcode',
  'tooling',
] as const;

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        'src/main.ts',
      ],
    },
  },
  resolve: {
    alias: [
      ...arcadeRuntimeCapabilities.map((capability) => ({
        find: `@arcade/runtime/${capability}`,
        replacement: arcadeRuntimeModule,
      })),
      { find: '@arcade/runtime', replacement: arcadeRuntimeModule },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
});
