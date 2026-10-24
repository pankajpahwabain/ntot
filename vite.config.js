import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// All project files sit in one folder, so there is no "public" folder.
// This small plugin copies the app-install files into the build output.
const STATIC_FILES = ['sw.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    apply: 'build',
    generateBundle() {
      for (const f of STATIC_FILES) {
        this.emitFile({ type: 'asset', fileName: f, source: readFileSync(f) });
      }
    }
  };
}

export default defineConfig({
  publicDir: false,
  plugins: [react(), copyStaticFiles()]
});
