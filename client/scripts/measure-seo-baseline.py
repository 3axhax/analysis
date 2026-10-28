"""Public-only SEO snapshot; never accept result URLs, query strings or credentials."""
import argparse
import concurrent.futures
import datetime
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ORIGIN = 'https://proanalize.ru'
PATHS = ('/', '/about', '/contacts', '/privacy-policy', '/consent-personal-data')

class Head(HTMLParser):
    def __init__(self):
        super().__init__(); self.h1 = 0; self.canonical = None; self.styles = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if tag == 'link' and a.get('rel') == 'canonical':
            value = a.get('href', '')
            self.canonical = value if value in {ORIGIN + p for p in PATHS} else 'unexpected_redacted'
        if tag == 'link' and a.get('rel') == 'stylesheet': self.styles += 1

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None

OPENER = urllib.request.build_opener(NoRedirect())
def fetch(url, timeout=45):
    # All call sites construct fixed, public-only URLs. Do not add arbitrary URL input.
    try:
        with OPENER.open(urllib.request.Request(url, headers={'User-Agent': 'ProAnalizePublicBaseline/1.0'}), timeout=timeout) as r:
            return r.status, r.headers, r.read(5 * 1024 * 1024)
    except urllib.error.HTTPError as e:
        return e.code, e.headers, b''

def page(path):
    started = time.monotonic()
    try:
        status, headers, body = fetch(ORIGIN + path)
        p = Head(); text = body.decode('utf8', errors='replace'); p.feed(text)
        return {'path': path, 'status': status, 'canonical': p.canonical, 'h1_count': p.h1,
                'prerendered': 'data-prerendered="true"' in text, 'stylesheet_links': p.styles,
                'body_bytes': len(body), 'x_robots_tag': headers.get('X-Robots-Tag'),
                'http_fetch_ms_not_cwv': round((time.monotonic()-started)*1000),
                'legacy_analytics_present': bool(re.search(r'mc\.yandex\.|webvisor:\s*true', text))}
    except (OSError, ValueError): return {'path': path, 'status': 'unavailable'}

def finite(value):
    return value if isinstance(value, (int, float)) and not isinstance(value, bool) and float('-inf') < value < float('inf') else None

def psi(strategy):
    url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?' + urllib.parse.urlencode({'url': ORIGIN+'/', 'strategy': strategy, 'category': 'performance'})
    try:
        status, _, body = fetch(url, timeout=55)
        if status != 200: return {'strategy': strategy, 'status': 'unavailable', 'http_status': status}
        data = json.loads(body)
        lr = data.get('lighthouseResult', {}); audits = lr.get('audits', {})
        metrics = {name: finite(audits.get(name, {}).get('numericValue')) for name in ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint']}
        return {'strategy': strategy, 'status': 'available' if lr else 'unavailable',
                'lighthouse_version': lr.get('lighthouseVersion'),
                'lab_performance_score': finite(lr.get('categories', {}).get('performance', {}).get('score')),
                'lab_metrics': metrics,
                'field_metrics_from_psi': {name: {'p75': finite(value.get('percentile')), 'category': value.get('category') if value.get('category') in ['FAST','AVERAGE','SLOW'] else None}
                    for name, value in data.get('loadingExperience', {}).get('metrics', {}).items()
                    if name in ['LARGEST_CONTENTFUL_PAINT_MS','CUMULATIVE_LAYOUT_SHIFT_SCORE','INTERACTION_TO_NEXT_PAINT']},
                'field_cwv_assessment': 'not_established_by_this_snapshot'}
    except (OSError, ValueError, KeyError): return {'strategy': strategy, 'status': 'unavailable', 'reason': 'request_failed'}

def run(skip_performance=False):
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: pages = list(pool.map(page, PATHS))
    try:
        status, _, body = fetch(ORIGIN+'/sitemap.xml')
        urls = [node.text for node in ET.fromstring(body).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        sitemap = {'status': status, 'public_urls': [url for url in urls if url in {ORIGIN+p for p in PATHS}], 'unexpected_url_count': sum(url not in {ORIGIN+p for p in PATHS} for url in urls)}
    except (OSError, ValueError, ET.ParseError): sitemap = {'status': 'unavailable'}
    if skip_performance:
        performance = [{'status': 'not_requested'}]
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: performance = list(pool.map(psi, ['mobile','desktop']))
    return {'measured_at_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'origin': ORIGIN,
            'scope': 'published_public_pages_only', 'pages': pages, 'sitemap': sitemap, 'performance': performance,
            'search_console': {'status': 'access_required', 'indexed_pages': None, 'clicks': None, 'impressions': None, 'queries': None},
            'yandex_webmaster': {'status': 'access_required', 'indexed_pages': None, 'clicks': None, 'impressions': None, 'queries': None},
            'ai_referrals': {'status': 'unavailable_no_safe_collector', 'count': None}}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--skip-performance', action='store_true', help='HTTP-only verification without repeating a quota-limited PSI request')
    args = parser.parse_args()
    result = run(args.skip_performance); args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print('Public baseline written; no visitor data, raw PSI payloads or private URLs retained')
    print('PSI status: '+', '.join(x.get('strategy', 'performance')+'='+x['status'] for x in result['performance']))
