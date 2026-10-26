// Generate route-specific heads without rendering app content or private data.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { getPageMetadata, renderPageHead, publicPaths, servicePaths } from '../src/shared/lib/seo/page-metadata.mjs';

const dist = new URL('../dist/', import.meta.url);
const index = new URL('index.html', dist);
const shell = readFileSync(index, 'utf8');

for (const path of [...publicPaths, ...servicePaths, '/result/synthetic', '/not-found']) {
  if (path !== '/' && !/^\/[a-zA-Z/-]+$/.test(path)) throw new Error('Invalid metadata route');
  const destination = new URL(getPageMetadata(path).htmlFile, dist);
  mkdirSync(new URL('./', destination), { recursive: true });
  writeFileSync(destination, renderPageHead(shell, path));
}
console.log(`Generated page metadata for ${publicPaths.length} public and ${servicePaths.length} service routes`);
