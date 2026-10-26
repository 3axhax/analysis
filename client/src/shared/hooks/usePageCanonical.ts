import { useEffect } from "react";
import { getCanonicalUrl } from "@shared/lib/seo/canonical.ts";

export function usePageCanonical(pathname: string) {
  useEffect(() => {
    const href = getCanonicalUrl(pathname);
    const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];
    const link = links.shift();
    links.forEach((duplicate) => duplicate.remove());

    if (!href) {
      link?.remove();
      return;
    }

    const canonical = link ?? document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = href;
    if (!link) document.head.appendChild(canonical);
  }, [pathname]);
}
