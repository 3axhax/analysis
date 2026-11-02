import { useEffect } from "react";
import { getPageMetadata } from "@shared/lib/seo/page-metadata.mjs";

export function usePageMetadata(pathname: string) {
  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    document.documentElement.lang = metadata.lang;
    document.title = metadata.title;

    const descriptions = [...document.head.querySelectorAll<HTMLMetaElement>('meta[name="description"]')];
    const description = descriptions.shift() ?? document.createElement("meta");
    descriptions.forEach((duplicate) => duplicate.remove());
    description.name = "description";
    description.content = metadata.description;
    if (!description.isConnected) document.head.appendChild(description);

    const icons = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')];
    const icon = icons.shift() ?? document.createElement("link");
    icons.forEach((duplicate) => duplicate.remove());
    icon.rel = "icon";
    icon.type = "image/svg+xml";
    icon.href = metadata.favicon;
    icon.setAttribute("sizes", "any");
    if (!icon.isConnected) document.head.appendChild(icon);

    const scripts = [...document.head.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')];
    const script = scripts.shift();
    scripts.forEach((duplicate) => duplicate.remove());
    if (!metadata.structuredData) {
      script?.remove();
      return;
    }
    const structuredData = script ?? document.createElement("script");
    structuredData.id = "page-structured-data";
    structuredData.type = "application/ld+json";
    structuredData.textContent = JSON.stringify(metadata.structuredData).replace(/</g, "\\u003c");
    if (!structuredData.isConnected) document.head.appendChild(structuredData);
  }, [pathname]);
}
