import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE || '/Quackpot/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
