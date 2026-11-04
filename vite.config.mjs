import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE || '/Quackpot/',
  // Scan the game entry, not archived/experimental HTML under reports/.
  // Report pages remain available on demand through the dev server.
  optimizeDeps: {
    entries: ['index.html'],
  },
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
