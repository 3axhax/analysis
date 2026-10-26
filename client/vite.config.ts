import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { renderPageHead } from './src/shared/lib/seo/page-metadata.mjs'

export default defineConfig({
  plugins: [
      react(),
    tailwindcss(),
    {
      name: 'page-metadata-dev',
      apply: 'serve',
      transformIndexHtml(html, context) {
        const pathname = new URL(context.originalUrl ?? context.path, 'http://localhost').pathname;
        return renderPageHead(html, pathname);
      },
    },
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@app': '/src/app',
      '@pages': '/src/pages',
      '@widgets': '/src/widgets',
      '@features': '/src/features',
      '@entities': '/src/entities',
      '@shared': '/src/shared',
      '@locales': '/src/locales',
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
})
