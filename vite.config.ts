import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { runtimeSpriteProjection } from './scripts/vite-runtime-sprite-plugin.mjs';

export default defineConfig({
  // The artifacts hub mounts this build below /ethic-brawl/. Relative bundle
  // URLs keep both the standalone preview and the deployed subpath working.
  base: './',
  publicDir: false,
  plugins: [runtimeSpriteProjection()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    manifest: true,
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/vendor/arcade-runtime.')) return 'arcade-runtime';
          if (
            id.includes('/src/content/characters/') ||
            id.includes('/src/render/sprites/') ||
            id.includes('/src/content/specials/') ||
            id.includes('/src/game/specials/')
          ) {
            return 'fighter-content';
          }
          if (id.includes('/src/game/campaign/') || id.includes('/src/content/stages/')) {
            return 'campaign';
          }
          if (id.includes('/src/content/items/') || id.includes('/src/game/items/')) return 'items';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
