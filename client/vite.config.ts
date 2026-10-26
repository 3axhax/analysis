import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  renderPageHead,
  publicPaths,
} from "./src/shared/lib/seo/page-metadata.mjs";
import type { ViteDevServer } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    (() => {
      let server: ViteDevServer;
      return {
        name: "page-metadata-dev",
        apply: "serve" as const,
        configureServer(devServer: ViteDevServer) {
          server = devServer;
        },
        async transformIndexHtml(
          html: string,
          context: { originalUrl?: string; path: string },
        ) {
          const pathname = new URL(
            context.originalUrl ?? context.path,
            "http://localhost",
          ).pathname;
          let result = renderPageHead(html, pathname);
          const path = pathname.replace(/\/+$/, "") || "/";
          if (publicPaths.includes(path)) {
            const { renderPublicPage } = await server.ssrLoadModule(
              "/src/entry-server.tsx",
            );
            result = result.replace(
              '<div id="root"></div>',
              `<div id="root" data-prerendered="true">${renderPublicPage(path)}</div>`,
            );
          }
          return result;
        },
      };
    })(),
  ],
  resolve: {
    alias: {
      "@": "/src",
      "@app": "/src/app",
      "@pages": "/src/pages",
      "@widgets": "/src/widgets",
      "@features": "/src/features",
      "@entities": "/src/entities",
      "@shared": "/src/shared",
      "@locales": "/src/locales",
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
