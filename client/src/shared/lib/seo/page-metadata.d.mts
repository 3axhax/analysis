export interface PageMetadata {
  lang: string;
  title: string;
  description: string;
  favicon: string;
  canonical: string | null;
  structuredData: Record<string, unknown> | null;
  htmlFile: string;
}

export const publicPaths: string[];
export const servicePaths: string[];
export function getPageMetadata(pathname: string, articleTitle?: string, articleDescription?: string): PageMetadata;
export function renderPageHead(html: string, pathname: string, articleTitle?: string, articleDescription?: string): string;
