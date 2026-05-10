import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite picks up `index.html` at the project root by default.
// The standalone (Babel-in-browser) demo lives at `Archmage Ascension.html`
// and is preserved as-is for design-tool parity / offline use.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
  },
});
