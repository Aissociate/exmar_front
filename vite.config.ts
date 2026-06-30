import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Dev-only: serve the admin sub-app (admin/index.html) for any /admin/* deep link,
// so client-side routes like /admin/dossiers don't fall back to the public index.html.
function adminSpaFallback(): Plugin {
  return {
    name: 'admin-spa-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || '';
        const accepts = req.headers.accept || '';
        const isAsset = /\.[a-zA-Z0-9]+(\?.*)?$/.test(url) || url.includes('/@') || url.includes('/node_modules');
        if (accepts.includes('text/html') && /^\/admin(\/|$|\?)/.test(url) && !isAsset) {
          req.url = '/admin/index.html';
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), adminSpaFallback()],
  resolve: {
    alias: {
      // Required by the admin app's .docx report exporter.
      docx: path.resolve(__dirname, 'node_modules/docx/dist/index.mjs'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['docx', 'file-saver'],
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
      },
    },
  },
});
