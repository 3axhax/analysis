// Only the consent-gated public-page tracker may load Metrica.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const root = new URL('../dist/', import.meta.url);
const htmlFiles = ['index.html', '_result.html', '_spa.html', ...readdirSync(new URL('_pages/', root)).filter(f => f.endsWith('.html')).map(f => '_pages/' + f)];
const assets = readdirSync(new URL('assets/', root)).filter(f => f.endsWith('.js')).map(f => 'assets/' + f);
for (const file of [...htmlFiles, ...assets]) {
  const text = readFileSync(new URL(file, root), 'utf8');
  assert.ok(!/webvisor\s*:\s*true|initYM|mc\.yandex\.ru\/watch\//.test(text), 'Legacy analytics returned in ' + file);
  if (file.endsWith('.html')) assert.ok(!/mc\.yandex\./.test(text), 'HTML must not load analytics before consent: ' + file);
}
console.log('Privacy build checks passed: HTML contains no collector; legacy replay and unconditional beacons are absent');
