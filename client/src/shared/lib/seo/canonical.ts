import { getPageMetadata } from "@shared/lib/seo/page-metadata.mjs";

// Use a fixed origin and public allowlist: never canonicalize a private result URL.
export function getCanonicalUrl(pathname: string): string | null {
  return getPageMetadata(pathname).canonical;
}
