import type { ArticleCatalog } from "./article-catalog";
export function groupPath(alias: string): string;
export function pointPath(alias: string): string;
export function isArticleCatalogPath(path: string): boolean;
export function getArticleRoute(path: string, catalog?: ArticleCatalog): { title: string; description: string } | undefined;
