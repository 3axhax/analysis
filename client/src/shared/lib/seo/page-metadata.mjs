// Shared by the build generator and the browser: no request or medical data.
import config from '../../config/page-metadata.json' with { type: 'json' };
import canonical from '../../config/canonical-pages.json' with { type: 'json' };

export const publicPaths = canonical.paths;
export const servicePaths = Object.keys(config.servicePages);

export function getPageMetadata(pathname) {
  let path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/analysis') path = '/';
  const isPublic = publicPaths.includes(path);
  const isResult = /^\/result\/[^/]+$/.test(path);
  const service = config.servicePages[path];
  const entry = isPublic ? config.pages[path] : service ?? (isResult ? config.result : config.notFound);
  if (!entry) throw new Error('Missing public page metadata');
  const url = isPublic ? `${canonical.origin}${path}` : null;
  const organizationId = `${canonical.origin}/#organization`;
  const websiteId = `${canonical.origin}/#website`;
  const structuredData = isPublic ? {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': organizationId, name: config.name, alternateName: config.alternateName, url: `${canonical.origin}/`, logo: `${canonical.origin}${config.favicon}` },
      { '@type': 'WebSite', '@id': websiteId, name: config.name, url: `${canonical.origin}/`, inLanguage: config.lang, publisher: { '@id': organizationId } },
      { '@type': entry.schemaType, '@id': `${url}#webpage`, url, name: entry.title, description: entry.description, inLanguage: config.lang, isPartOf: { '@id': websiteId } },
    ],
  } : null;
  const htmlFile = isPublic || service
    ? path === '/' ? 'index.html' : `_pages${path}.html`
    : isResult ? '_result.html' : '_spa.html';
  return { lang: config.lang, title: entry.title, description: entry.description, favicon: config.favicon, canonical: url, structuredData, htmlFile };
}

const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderPageHead(html, pathname) {
  const metadata = getPageMetadata(pathname);
  const shell = html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '')
    .replace(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
  ];
  if (metadata.canonical) tags.push(`<link rel="canonical" href="${metadata.canonical}">`);
  if (metadata.structuredData) {
    const json = JSON.stringify(metadata.structuredData).replace(/</g, '\\u003c');
    tags.push(`<script id="page-structured-data" type="application/ld+json">${json}</script>`);
  }
  if (!shell.includes('</head>')) throw new Error('Built HTML head missing');
  return shell.replace('</head>', `${tags.join('\n')}\n</head>`);
}
