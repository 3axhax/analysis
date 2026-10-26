// Generate route-specific heads without rendering app content or private data.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const pages = JSON.parse(readFileSync(new URL('../src/shared/config/canonical-pages.json', import.meta.url), 'utf8'));
const dist = new URL('../dist/', import.meta.url);
const index = new URL('index.html', dist);
// Strip any existing canonical to keep this script safe to run more than once.
const shell = readFileSync(index, 'utf8').replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '');
if (!shell.includes('</head>')) throw new Error('Built HTML head missing');
mkdirSync(new URL('_pages/', dist), { recursive: true });
writeFileSync(new URL('_spa.html', dist), shell);

for (const path of pages.paths) {
  if (path !== '/' && !/^\/[a-z-]+$/.test(path)) throw new Error('Invalid public canonical route');
  const href = `${pages.origin}${path}`;
  const html = shell.replace('</head>', `  <link rel="canonical" href="${href}">\n</head>`);
  const destination = path === '/' ? index : new URL(`_pages/${path.slice(1)}.html`, dist);
  writeFileSync(destination, html);
}
console.log(`Generated canonical HTML for ${pages.paths.length} public routes`);
