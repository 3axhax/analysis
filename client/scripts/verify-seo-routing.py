#!/usr/bin/env python3
"""HTTP regression checks against isolated Nginx, with no application DB.

Run from the repository root after client build:
  python3 client/scripts/verify-seo-routing.py --dist client/dist
Requires Docker (nginx:alpine) and openssl. Published ports bind only to loopback.
The proxy's certificate is generated for this test; HTTPS verification uses that CA.
"""

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import ssl
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.request
import uuid
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]


def docker(*args):
    return subprocess.check_output(["docker", *args], stderr=subprocess.STDOUT).decode().strip()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class RoutingChecks(unittest.TestCase):
    def canonicals(self, body):
        class Links(HTMLParser):
            def __init__(self):
                super().__init__()
                self.urls = []

            def handle_starttag(self, tag, attrs):
                values = dict(attrs)
                if tag == "link" and values.get("rel") == "canonical":
                    self.urls.append(values.get("href"))

        parser = Links()
        parser.feed(body.decode())
        return parser.urls

    def test_public_canonical_in_source(self):
        for path in ["/", "/about", "/contacts", "/privacy-policy", "/consent-personal-data"]:
            for suffix in (["", "/"] if path != "/" else [""]):
                for query in ["", "?utm_source=seo&probe=1"]:
                    with self.subTest(path=path + suffix + query):
                        status, _, body = self.get(path + suffix + query)
                        self.assertEqual(status, 200)
                        self.assertEqual(self.canonicals(body), ["https://proanalize.ru" + path])

    def test_no_home_canonical_on_service_or_error(self):
        for path in ["/result/synthetic", "/admin/units", "/test", "/logout", "/seo-missing", "/assets/missing.js", "/_pages/about.html", "/_spa.html"]:
            with self.subTest(path=path):
                _, headers, body = self.get(path)
                self.assertEqual(self.canonicals(body), [])
                self.assertEqual(headers.get("X-Robots-Tag"), "noindex")

    def get(self, path, *, proxy=False, tls=False, host=None, headers=None):
        port = self.https_port if tls else self.http_port if proxy else self.client_port
        opener = urllib.request.build_opener(
            NoRedirect(), urllib.request.HTTPSHandler(context=self.tls_context)
        )
        request_headers = dict(headers or {})
        if host:
            request_headers["Host"] = host
        request = urllib.request.Request(
            f"{'https' if tls else 'http'}://127.0.0.1:{port}{path}",
            headers=request_headers,
        )
        try:
            response = opener.open(request, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.code, response.headers, response.read()

    def test_public_routes(self):
        for path in ["/", "/about", "/contacts", "/privacy-policy", "/consent-personal-data"]:
            for suffix in ["", "/"] if path != "/" else [""]:
                with self.subTest(path=path + suffix):
                    status, headers, body = self.get(path + suffix)
                    self.assertEqual(status, 200)
                    self.assertIn(b'id="root"', body)
                    self.assertIsNone(headers.get("X-Robots-Tag"))

    def test_service_routes(self):
        for path in [
            "/result/" + "0" * 40, "/result/synthetic-missing", "/test", "/logout",
            "/admin/translations", "/admin/units", "/admin/ages",
            "/admin/descriptions", "/admin/analysisPoints", "/admin/analysisType",
        ]:
            for suffix in ["", "/"]:
                with self.subTest(path=path + suffix):
                    status, headers, body = self.get(path + suffix)
                    self.assertEqual(status, 200)
                    self.assertEqual(headers.get("X-Robots-Tag"), "noindex")
                    self.assertIn(b'id="root"', body)

    def test_unknown_routes_and_files(self):
        for path in [
            "/seo-missing", "/about/child", "/admin", "/admin/missing",
            "/result", "/result/id/child", "/assets/missing.js", "/missing.svg",
            "/missing.xml", "/_seo-404.html", "/robots.txt/extra",
        ]:
            with self.subTest(path=path):
                status, headers, _ = self.get(path)
                self.assertEqual(status, 404)
                self.assertEqual(headers.get("X-Robots-Tag"), "noindex")

    def test_404_renders_spa_error(self):
        status, _, body = self.get("/seo-missing")
        self.assertEqual(status, 404)
        self.assertIn(b'id="root"', body)

    def test_analysis_redirect(self):
        for path in ["/analysis", "/analysis/"]:
            status, headers, _ = self.get(path + "?utm_source=seo&probe=1")
            self.assertEqual(status, 301)
            self.assertEqual(headers["Location"], "/?utm_source=seo&probe=1")

    def test_robots_and_sitemap(self):
        status, headers, body = self.get("/robots.txt")
        self.assertEqual(status, 200)
        self.assertIn("text/plain", headers["Content-Type"])
        robots = body.decode()
        self.assertIn("Sitemap: https://proanalize.ru/sitemap.xml", robots)
        # noindex HTML must remain crawlable, including to remove old index entries.
        from urllib.robotparser import RobotFileParser
        parser = RobotFileParser()
        parser.parse(robots.splitlines())
        for agent in ["Googlebot", "YandexBot", "generic"]:
            for path in ["/", "/assets/probe.js", "/admin/units", "/result/synthetic"]:
                self.assertTrue(parser.can_fetch(agent, "https://proanalize.ru" + path))
        status, headers, body = self.get("/sitemap.xml")
        self.assertEqual(status, 200)
        self.assertIn("xml", headers["Content-Type"])
        document = ET.fromstring(body)
        ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
        self.assertEqual(document.tag, ns + "urlset")
        urls = [node.text for node in document.iter(ns + "loc")]
        self.assertEqual(urls, ["https://proanalize.ru/"])

    def test_actual_built_assets(self):
        _, _, html = self.get("/")
        assets = re.findall(r'(?:src|href)="(/assets/[^\"]+)"', html.decode())
        self.assertTrue(assets)
        for asset in assets:
            status, headers, body = self.get(asset)
            self.assertEqual(status, 200)
            self.assertGreater(len(body), 0)
            self.assertNotIn("text/html", headers["Content-Type"])
            self.assertIn("immutable", ",".join(headers.get_all("Cache-Control", [])))

    def test_noindex_on_conditional_response(self):
        _, headers, _ = self.get("/admin/units")
        status, headers, _ = self.get("/admin/units", headers={"If-None-Match": headers["ETag"]})
        self.assertEqual(status, 304)
        self.assertEqual(headers.get("X-Robots-Tag"), "noindex")

    def test_proxy_host_redirects(self):
        for host in ["proanalize.ru", "www.proanalize.ru", "unexpected.example"]:
            status, headers, _ = self.get("/about?probe=1", proxy=True, host=host)
            self.assertEqual(status, 301)
            self.assertEqual(headers["Location"], "https://proanalize.ru/about?probe=1")
        status, headers, _ = self.get("/contacts?probe=1", tls=True, host="www.proanalize.ru")
        self.assertEqual(status, 301)
        self.assertEqual(headers["Location"], "https://proanalize.ru/contacts?probe=1")

    def test_proxy_preserves_client_status_headers(self):
        for path, expected in [("/", 200), ("/result/synthetic", 200), ("/admin/units", 200), ("/seo-missing", 404)]:
            status, headers, _ = self.get(path, tls=True, host="proanalize.ru")
            self.assertEqual(status, expected)
            self.assertEqual(headers.get("X-Robots-Tag"), None if path == "/" else "noindex")
        status, headers, _ = self.get("/analysis?probe=1", tls=True, host="proanalize.ru")
        self.assertEqual(status, 301)
        self.assertEqual(headers["Location"], "/?probe=1")

    def test_proxy_api_remains_separate(self):
        status, headers, body = self.get("/api/health", tls=True, host="proanalize.ru")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body), {"status": "seo-test-backend"})
        self.assertEqual(headers.get("X-Robots-Tag"), "noindex")
        status, headers, _ = self.get("/api/missing", tls=True, host="proanalize.ru")
        self.assertEqual(status, 404)
        self.assertEqual(headers.get("X-Robots-Tag"), "noindex")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", type=Path, required=True)
    args = parser.parse_args()
    if not (args.dist / "index.html").is_file():
        parser.error("Build the client first")
    containers = []
    network = "analysis-seo-test-" + uuid.uuid4().hex[:10]
    try:
        with tempfile.TemporaryDirectory(prefix="analysis-seo-") as directory:
            temp = Path(directory)
            subprocess.run([
                "openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
                "-keyout", str(temp / "privkey.pem"), "-out", str(temp / "fullchain.pem"),
                "-subj", "/CN=seo-test.local", "-addext", "subjectAltName=IP:127.0.0.1",
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            (temp / "api.conf").write_text('''server {
                listen 5050;
                location = /health { default_type application/json; return 200 '{"status":"seo-test-backend"}'; }
                location / { return 404; }
            }''')
            docker("network", "create", network)

            def start(role, alias, mounts, ports=()):
                name = network + "-" + role
                containers.append(name)
                command = ["run", "-d", "--name", name, "--network", network, "--network-alias", alias]
                for source, target in mounts:
                    command += ["-v", f"{source.resolve()}:{target}:ro"]
                for port in ports:
                    command += ["-p", f"127.0.0.1::{port}"]
                docker(*command, "nginx:alpine")
                return name

            client = start("client", "client_analysis", [
                (args.dist, "/usr/share/nginx/html"),
                (ROOT / "client/nginx/client.conf", "/etc/nginx/conf.d/default.conf"),
            ], (80,))
            start("api", "server_analysis", [(temp / "api.conf", "/etc/nginx/conf.d/default.conf")])
            proxy = start("proxy", "seo_proxy", [
                (ROOT / "nginx/default.conf", "/etc/nginx/conf.d/default.conf"),
                (temp, "/etc/nginx/ssl"),
            ], (80, 443))
            for name in [client, proxy]:
                docker("exec", name, "nginx", "-t")
            RoutingChecks.client_port = docker("port", client, "80/tcp").split(":")[-1]
            RoutingChecks.http_port = docker("port", proxy, "80/tcp").split(":")[-1]
            RoutingChecks.https_port = docker("port", proxy, "443/tcp").split(":")[-1]
            RoutingChecks.tls_context = ssl.create_default_context(cafile=str(temp / "fullchain.pem"))
            # Wait only for the isolated listeners; never probe the real backend.
            for attempt in range(30):
                try:
                    RoutingChecks().get("/", tls=True, host="proanalize.ru")
                    break
                except (OSError, urllib.error.URLError):
                    if attempt == 29:
                        raise
                    time.sleep(0.1)
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(RoutingChecks))
            return 0 if result.wasSuccessful() else 1
    finally:
        for name in reversed(containers):
            subprocess.run(["docker", "rm", "-f", name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["docker", "network", "rm", network], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == "__main__":
    raise SystemExit(main())
