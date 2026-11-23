import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router-dom/server.js";
import AppContainer from "@app/AppContainer";
import { InfoModalProvider } from "@app/providers/infoModalProvider";
import { createAppStore } from "@shared/store";
import { publicPaths } from "@shared/lib/seo/page-metadata.mjs";

import type { ArticleCatalog } from "@shared/catalog/article-catalog";
import { getArticleRoute } from "@shared/catalog/article-routes.mjs";

export function renderPublicPage(pathname: string, catalog?: ArticleCatalog): string {
  if (!publicPaths.includes(pathname) && !getArticleRoute(pathname, catalog))
    throw new Error("Only public pages may be prerendered");
  return renderToString(
    <StrictMode>
      <Provider store={createAppStore()}>
        <StaticRouter location={pathname}>
          <InfoModalProvider>
            <AppContainer initialCatalog={catalog} />
          </InfoModalProvider>
        </StaticRouter>
      </Provider>
    </StrictMode>,
  );
}
