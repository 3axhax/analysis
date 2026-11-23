import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "@app/App";
import "@shared/lib/i18n";
import type { ArticleCatalog } from "@shared/catalog/article-catalog";

const root = document.getElementById("root")!;
const catalogData = document.getElementById("article-catalog-data")?.textContent;
const initialCatalog: ArticleCatalog | undefined = catalogData ? JSON.parse(catalogData) : undefined;
const app = (
  <StrictMode>
    <App initialCatalog={initialCatalog} />
  </StrictMode>
);

if (root.dataset.prerendered === "true") hydrateRoot(root, app);
else createRoot(root).render(app);
