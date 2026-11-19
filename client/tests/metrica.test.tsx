// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { createMetricaTracker, METRICA_ID } from '../src/shared/config/metrica';

afterEach(() => { document.head.innerHTML = ''; localStorage.clear(); });
function setup(path = '/', consent: string | null = '1', origin = 'https://proanalize.ru') {
  if (consent !== null) localStorage.setItem('accept_ym', consent);
  const ym = vi.fn();
  const browser = { location: new URL(path, origin), localStorage, ym };
  const tracker = createMetricaTracker(browser as unknown as Window, document);
  const load = () => document.querySelector('script')?.dispatchEvent(new Event('load'));
  return { browser, ym, tracker, load };
}

for (const consent of [null, '0', 'unexpected']) {
  it(`does not load or send without affirmative consent (${consent})`, () => {
    const { tracker, ym } = setup('/', consent);
    tracker.update();
    expect(document.querySelector('script')).toBeNull();
    expect(ym).not.toHaveBeenCalled();
  });
}
for (const path of ['/result/synthetic', '/admin', '/missing', '/?private=synthetic', '/#synthetic']) {
  it(`does not load on excluded route ${path}`, () => {
    const { tracker, ym } = setup(path);
    tracker.update();
    expect(document.querySelector('script')).toBeNull();
    expect(ym).not.toHaveBeenCalled();
  });
}
it('does not load in local development', () => {
  const { tracker } = setup('/', '1', 'http://localhost:5173');
  tracker.update();
  expect(document.querySelector('script')).toBeNull();
});
it('loads once after consent and sends only canonical public addresses', () => {
  const { tracker, ym, load, browser } = setup('/', null);
  tracker.update();
  localStorage.setItem('accept_ym', '1');
  tracker.update(); tracker.update();
  expect(document.querySelectorAll('script')).toHaveLength(1);
  expect(document.querySelector('script')?.referrerPolicy).toBe('no-referrer');
  expect(ym).not.toHaveBeenCalled();
  load(); tracker.update();
  expect(ym.mock.calls).toEqual([
    [METRICA_ID, 'init', expect.objectContaining({ defer: true, url: 'https://proanalize.ru/', referrer: '', sendTitle: false, webvisor: false, clickmap: false, trackLinks: false, disableYtm: true })],
    [METRICA_ID, 'hit', 'https://proanalize.ru/', { title: 'Проанализируй', referer: '' }],
  ]);
  browser.location = new URL('https://proanalize.ru/about'); tracker.update();
  expect(ym).toHaveBeenLastCalledWith(METRICA_ID, 'hit', 'https://proanalize.ru/about', { title: 'Проанализируй', referer: '' });
  browser.location = new URL('https://proanalize.ru/result/synthetic'); tracker.update();
  expect(ym).toHaveBeenLastCalledWith(METRICA_ID, 'destruct');
  expect(JSON.stringify(ym.mock.calls)).not.toContain('synthetic');
});
it('cancels initialization when route changes during script loading', () => {
  const { tracker, ym, browser } = setup();
  tracker.update();
  const script = document.querySelector('script')!;
  browser.location = new URL('https://proanalize.ru/result/synthetic'); tracker.update();
  script.dispatchEvent(new Event('load'));
  expect(ym).not.toHaveBeenCalled();
  expect(document.querySelector('script')).toBeNull();
});
it('rechecks consent on load and destroys active counter on revocation', () => {
  const { tracker, ym, load } = setup();
  tracker.update(); localStorage.setItem('accept_ym', '0'); load();
  expect(ym).not.toHaveBeenCalled();
  localStorage.setItem('accept_ym', '1'); tracker.update();
  expect(ym).toHaveBeenCalledWith(METRICA_ID, 'init', expect.anything());
  localStorage.setItem('accept_ym', '0'); tracker.update();
  expect(ym).toHaveBeenLastCalledWith(METRICA_ID, 'destruct');
});
