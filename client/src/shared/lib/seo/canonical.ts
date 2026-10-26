import pages from "@shared/config/canonical-pages.json";

// Use a fixed origin and public allowlist: never canonicalize a private result URL.
export function getCanonicalUrl(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/analysis") return `${pages.origin}/`;
  return pages.paths.includes(path) ? `${pages.origin}${path}` : null;
}
