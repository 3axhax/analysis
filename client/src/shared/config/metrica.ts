import publicPages from './canonical-pages.json' with { type: 'json' };

export const METRICA_ID = 109419092;
export const METRICA_CONSENT_EVENT = 'metrica-consent-change';

type MetricaCall = (id: number, method: string, ...args: unknown[]) => void;
type MetricaWindow = Window & { ym?: MetricaCall };

export function createMetricaTracker(browser: Window, document: Document) {
  let script: HTMLScriptElement | undefined;
  let ready = false;
  let active = false;
  let lastUrl: string | undefined;
  let pendingUrl: string | undefined;
  const win = browser as MetricaWindow;

  const permittedUrl = () => {
    try {
      const { origin, pathname, search, hash } = browser.location;
      return browser.localStorage.getItem('accept_ym') === '1' &&
        origin === publicPages.origin && !search && !hash &&
        publicPages.paths.includes(pathname)
        ? `${publicPages.origin}${pathname}` : undefined;
    } catch {
      return undefined;
    }
  };

  const stop = () => {
    if (active) win.ym?.(METRICA_ID, 'destruct');
    active = false;
    lastUrl = undefined;
    pendingUrl = undefined;
    if (!ready && script) {
      script.onload = null;
      script.remove();
      script = undefined;
    }
  };

  const send = () => {
    const url = permittedUrl();
    if (!url || url !== pendingUrl) { stop(); return; }
    if (!win.ym) return;
    if (!active) {
      win.ym(METRICA_ID, 'init', {
        defer: true, url, referrer: '', sendTitle: false,
        webvisor: false, clickmap: false, trackLinks: false,
        trackHash: false, ecommerce: false, accurateTrackBounce: false,
        disableYtm: true,
      });
      active = true;
    }
    if (lastUrl !== url) {
      win.ym(METRICA_ID, 'hit', url, { title: 'Проанализируй', referer: '' });
      lastUrl = url;
    }
  };

  const update = () => {
    pendingUrl = permittedUrl();
    if (!pendingUrl) { stop(); return; }
    if (ready) { send(); return; }
    if (script) return;
    if (!win.ym) {
      const queue = Object.assign(
        (...args: Parameters<MetricaCall>) => { queue.a.push(args); },
        { a: [] as Parameters<MetricaCall>[], l: Date.now() },
      );
      win.ym = queue;
    }
    script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    script.onload = () => { ready = true; send(); };
    script.onerror = () => { script?.remove(); script = undefined; };
    document.head.append(script);
  };

  return { update, stop };
}
