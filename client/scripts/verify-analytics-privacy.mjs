// Build regression: analytics must stay disabled until a privacy-safe collector exists.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
const htmlFiles = ['index.html', '_result.html', '_spa.html', ...readdirSync(new URL('_pages/', root)).filter(f => f.endsWith('.html')).map(f => '_pages/' + f)];
const assets = readdirSync(new URL('assets/', root)).filter(f => f.endsWith('.js')).map(f => 'assets/' + f);
for (const file of [...htmlFiles, ...assets]) {
  const text = readFileSync(new URL(file, root), 'utf8');
  assert.ok(!/mc\.yandex\.|metrika\/tag|webvisor\s*:\s*true|initYM/.test(text), 'External collector returned in ' + file);
}
assert.ok(!readFileSync(new URL('../src/app/AppContainer.tsx', import.meta.url), 'utf8').includes('PoliticsAgreementBlock'), 'Disabled analytics must not offer a consent prompt');
console.log('Privacy build checks passed: public/service/result/error HTML and JS assets contain no legacy collector');
