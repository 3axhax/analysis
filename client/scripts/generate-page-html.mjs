// Generate static public content and route-specific heads, never private data.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { getPageMetadata, renderPageHead, publicPaths, servicePaths } from '../src/shared/lib/seo/page-metadata.mjs';
import { getArticleRoute, groupPath, pointPath, isArticleCatalogPath } from '../src/shared/catalog/article-routes.mjs';
import http from 'node:http';
import https from 'node:https';

const catalogFile = process.env.ARTICLE_CATALOG_FILE;
const catalogUrl = process.env.ARTICLE_CATALOG_URL;
let catalog;
if (catalogFile) {
  catalog = JSON.parse(readFileSync(catalogFile, 'utf8'));
} else if (catalogUrl) {
  const response = await fetch(catalogUrl, { signal: AbortSignal.timeout(10000), redirect: 'error' });
  if (!response.ok) throw new Error(`Article catalog request failed (HTTP ${response.status})`);
  catalog = await response.json();
} else if (process.env.REQUIRE_ARTICLE_CATALOG === '1') {
  throw new Error('Set ARTICLE_CATALOG_FILE or ARTICLE_CATALOG_URL to the public DB-backed catalog');
}

if (catalog) {
  const validAlias = ({ alias }) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(alias);
  if (!catalog.groups?.length || !catalog.points?.length ||
      !catalog.groups.every(validAlias) || !catalog.points.every(validAlias)) {
    throw new Error('Empty or invalid article catalog');
  }
}

// Rendering is pure and uses only the public data loaded above.
const denyNetwork = () => { throw new Error('Network access is forbidden during public prerender'); };
globalThis.fetch = denyNetwork;
http.request = denyNetwork;
http.get = denyNetwork;
https.request = denyNetwork;
https.get = denyNetwork;
const { renderPublicPage } = await import('../.prerender/entry-server.js');

const dist = new URL('../dist/', import.meta.url);
const shell = readFileSync(new URL('index.html', dist), 'utf8');
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('Expected fresh client HTML template; run npm run build first');
}

const routes = catalog ? [
  ...catalog.groups.map(({ alias }) => groupPath(alias).slice(0, -1)),
  ...catalog.points.map(({ alias }) => pointPath(alias).slice(0, -1)),
] : [];
const publicPages = new Set([...publicPaths, ...routes]);
const serializedCatalog = catalog && JSON.stringify(catalog).replace(/</g, '\\u003c');

for (const path of [...publicPages, ...servicePaths, '/result/synthetic', '/not-found']) {
  if (path !== '/' && !/^\/[a-zA-Z0-9/-]+$/.test(path)) throw new Error('Invalid metadata route');
  const article = getArticleRoute(path, catalog);
  const destination = new URL(getPageMetadata(path, article?.title).htmlFile, dist);
  mkdirSync(new URL('./', destination), { recursive: true });
  let html = renderPageHead(shell, path, article?.title, article?.description);
  if (publicPages.has(path)) {
    const pageCatalog = path === '/' || isArticleCatalogPath(path) ? catalog : undefined;
    const body = renderPublicPage(path, pageCatalog);
    if (!body.includes('<h1')) throw new Error('Public prerender missing primary heading');
    const data = pageCatalog ? `<script id="article-catalog-data" type="application/json">${serializedCatalog}</script>` : '';
    html = html.replace('<div id="root"></div>', () => `<div id="root" data-prerendered="true">${body}</div>${data}`);
  }
  writeFileSync(destination, html);
}

const sitemap = ['/', '/articles', ...routes].map((path) => {
  const { canonical } = getPageMetadata(path, getArticleRoute(path, catalog)?.title);
  return `  <url><loc>${canonical}</loc></url>`;
}).join('\n');
writeFileSync(new URL('sitemap.xml', dist), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
console.log(`Prerendered ${publicPages.size} public pages; private/service HTML remains client-only`);
