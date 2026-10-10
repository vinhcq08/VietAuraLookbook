import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function copySrcAssetsImagesPlugin() {
  return {
    name: 'copy-src-assets-images',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'src/assets/images');
      const destDir = path.resolve(__dirname, 'dist/src/assets/images');
      if (fs.existsSync(srcDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.cpSync(srcDir, destDir, { recursive: true });
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), copySrcAssetsImagesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
