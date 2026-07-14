import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // The artifacts hub mounts this build below /ethic-brawl/. Relative bundle
  // URLs keep both the standalone preview and the deployed subpath working.
  base: './',
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
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
