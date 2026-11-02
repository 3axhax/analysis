// Generate static public content and route-specific heads, never private data.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { getPageMetadata, renderPageHead, publicPaths, servicePaths } from '../src/shared/lib/seo/page-metadata.mjs';
import http from 'node:http';
import https from 'node:https';

// Prerendering never needs an API, a database proxy or external services.
const denyNetwork = () => { throw new Error('Network access is forbidden during public prerender'); };
globalThis.fetch = denyNetwork;
http.request = denyNetwork;
http.get = denyNetwork;
https.request = denyNetwork;
https.get = denyNetwork;
const { renderPublicPage } = await import('../.prerender/entry-server.js');

const dist = new URL('../dist/', import.meta.url);
const index = new URL('index.html', dist);
const shell = readFileSync(index, 'utf8');
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('Expected fresh client HTML template; run npm run build first');
}

for (const path of [...publicPaths, ...servicePaths, '/result/synthetic', '/not-found']) {
  if (path !== '/' && !/^\/[a-zA-Z/-]+$/.test(path)) throw new Error('Invalid metadata route');
  const destination = new URL(getPageMetadata(path).htmlFile, dist);
  mkdirSync(new URL('./', destination), { recursive: true });
  let html = renderPageHead(shell, path);
  if (publicPaths.includes(path)) {
    const body = renderPublicPage(path);
    if (!body.includes('<h1')) throw new Error('Public prerender missing primary heading');
    html = html.replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${body}</div>`);
  }
  writeFileSync(destination, html);
}
console.log(`Prerendered ${publicPaths.length} public pages; private/service HTML remains client-only`);
