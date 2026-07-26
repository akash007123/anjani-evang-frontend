import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: [
        'ckeditor5',
        '@ckeditor/ckeditor5-react',
        '@ckeditor/ckeditor5-integrations-common',
        '@ckeditor/ckeditor5-editor-classic',
        '@ckeditor/ckeditor5-essentials',
        '@ckeditor/ckeditor5-paragraph',
        '@ckeditor/ckeditor5-basic-styles',
        '@ckeditor/ckeditor5-ui',
        '@ckeditor/ckeditor5-engine',
        '@ckeditor/ckeditor5-core',
        '@ckeditor/ckeditor5-utils',
        '@ckeditor/ckeditor5-typing',
        '@ckeditor/ckeditor5-watchdog',
        '@ckeditor/ckeditor5-upload',
        '@ckeditor/ckeditor5-link',
        '@ckeditor/ckeditor5-table',
        '@ckeditor/ckeditor5-image',
        '@ckeditor/ckeditor5-list',
        '@ckeditor/ckeditor5-clipboard',
        '@ckeditor/ckeditor5-enter',
        '@ckeditor/ckeditor5-select-all',
        '@ckeditor/ckeditor5-undo',
        '@ckeditor/ckeditor5-widget',
        '@ckeditor/ckeditor5-heading',
        '@ckeditor/ckeditor5-block-quote',
        '@ckeditor/ckeditor5-indent',
        '@ckeditor/ckeditor5-font',
        '@ckeditor/ckeditor5-highlight',
        '@ckeditor/ckeditor5-horizontal-line',
        '@ckeditor/ckeditor5-alignment',
        '@ckeditor/ckeditor5-media-embed',
        '@ckeditor/ckeditor5-remove-format',
        '@ckeditor/ckeditor5-source-editing',
        '@ckeditor/ckeditor5-special-characters',
        '@ckeditor/ckeditor5-style',
        '@ckeditor/ckeditor5-code-block',
        '@ckeditor/ckeditor5-find-and-replace',
        '@ckeditor/ckeditor5-html-support',
        '@ckeditor/ckeditor5-autoformat',
        '@ckeditor/ckeditor5-paste-from-office',
        '@ckeditor/ckeditor5-mention',
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR === 'true' ? false : true,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000',
          changeOrigin: true
        },
        '/uploads': {
          target: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
  };
});
