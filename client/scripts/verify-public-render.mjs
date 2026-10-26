// SSG isolation regression checks. No API, database, tokens or clinical fixtures.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import http from 'node:http';
import https from 'node:https';
import { publicPaths, getPageMetadata } from '../src/shared/lib/seo/page-metadata.mjs';

const deny = () => { throw new Error('Unexpected network access during static rendering'); };
globalThis.fetch = deny;
http.request = http.get = https.request = https.get = deny;
const { renderPublicPage } = await import('../.prerender/entry-server.js');
const require = createRequire(import.meta.url);
const ts = require('typescript');
for (const file of ['pages/policyPersonalData/ui/PolicyPersonalData.tsx', 'pages/consentPersonalData/ui/ConsentPersonalDataPage.tsx']) {
  const text = readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(source) === 'p') {
      assert.ok(!node.children.some(child => ts.isJsxElement(child) && ['p','ul','ol','div','table','h1','h2','h3'].includes(child.openingElement.tagName.getText(source))), 'Block content inside a paragraph breaks hydration');
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

for (const path of publicPaths) {
  const html = renderPublicPage(path);
  assert.ok(html.includes('<h1'), 'Public heading missing');
  const header = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
  assert.ok(header, 'Public header missing');
  for (const svg of header.matchAll(/<svg\b[^>]*>/g)) {
    assert.match(svg[0], /\bwidth="[1-9]\d*"/, 'Header icon needs intrinsic width before CSS');
    assert.match(svg[0], /\bheight="[1-9]\d*"/, 'Header icon needs intrinsic height before CSS');
  }
  assert.ok(html === renderPublicPage(path), 'Static rendering must be deterministic');
  if (path === '/') {
    assert.ok(html.includes('type="file"') && html.includes('<form'), 'Initial form must be present before hydration');
    assert.ok(!html.includes('data-client-placeholder'), 'Approximate form placeholder must not return');
  }
}
for (const path of ['/result/synthetic', '/admin/units', '/test', '/logout', '/missing', '/about/child', '/about?probe=1']) {
  assert.throws(() => renderPublicPage(path), /Only public pages/);
}

const files = [...publicPaths.map(path => getPageMetadata(path).htmlFile), '_result.html', '_spa.html'];
for (const file of publicPaths.map(path => getPageMetadata(path).htmlFile)) {
  const builtHtml = readFileSync(new URL('../dist/' + file, import.meta.url), 'utf8');
  const head = builtHtml.split('</head>')[0];
  assert.match(head, /<link[^>]*rel="stylesheet"[^>]*href="\/assets\/[^" ]+\.css"/, 'Public HTML must load blocking CSS before its body');
}
const before = files.map(file => readFileSync(new URL('../dist/' + file, import.meta.url)));
const repeat = spawnSync(process.execPath, ['scripts/generate-page-html.mjs'], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
assert.notEqual(repeat.status, 0, 'Generator must reject an already prerendered template');
assert.ok(repeat.stderr.includes('Expected fresh client HTML template'));
files.forEach((file, index) => assert.ok(before[index].equals(readFileSync(new URL('../dist/' + file, import.meta.url))), 'Rejected regeneration must not change artifacts'));
console.log('SSG checks passed: public-only allowlist, deterministic output, no network, initial form, safe regeneration refusal');
