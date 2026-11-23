import { createContext, useContext } from "react";

export interface ArticlePoint {
  id: number;
  alias: string;
  name: string;
  hint: string | null;
  description: string | null;
}

export interface ArticleGroup {
  alias: string;
  title: string;
  pointIds: number[];
}

export interface ArticleCatalog {
  groups: ArticleGroup[];
  points: ArticlePoint[];
}

export const ArticleCatalogContext = createContext<{
  catalog?: ArticleCatalog;
  failed: boolean;
}>({ failed: false });

export const useArticleCatalog = () => useContext(ArticleCatalogContext);
