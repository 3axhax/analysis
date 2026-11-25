import { Link } from "react-router-dom";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { groupPath } from "@shared/catalog/article-routes.mjs";
import { ArticleCatalogState } from "./ArticleCatalogState";

const imageFiles = import.meta.glob<string>(
  "../../shared/assets/article-groups/*.jpg",
  { eager: true, import: "default", query: "?url" },
);
const groupImages: Record<string, string> = Object.fromEntries(
  Object.entries(imageFiles).map(([path, url]) => [
    path
      .split("/")
      .pop()!
      .replace(/(?:-v1)?\.jpg$/, ""),
    url,
  ]),
);
groupImages["obshchiy-analiz-krovi"] = groupImages["complete-blood-count"];

export function ArticlesPage() {
  const { catalog, failed } = useArticleCatalog();
  if (!catalog) return <ArticleCatalogState failed={failed} />;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <h1 className="mb-4 text-3xl lg:text-4xl">Статьи</h1>
      <p className="mb-6">
        Узнайте, какие показатели входят в разные группы анализов.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {catalog.groups.map((group) => (
          <article
            key={group.alias}
            itemScope
            itemType="https://schema.org/Article"
            className="overflow-hidden rounded-xl border border-cyan-600 transition-shadow hover:shadow-md"
          >
            <Link
              to={groupPath(group.alias)}
              itemProp="url"
              className="group flex h-full flex-col text-white"
            >
              {groupImages[group.alias] && (
                <img
                  src={groupImages[group.alias]}
                  alt=""
                  width={960}
                  height={640}
                  className="aspect-[3/2] w-full object-cover"
                  itemProp="image"
                  decoding="async"
                  loading="lazy"
                />
              )}
              <span
                itemProp="headline"
                className="flex flex-1 items-center justify-center bg-gradient-to-br from-cyan-900 via-cyan-600 to-cyan-900 bg-[length:300%_100%] p-5 text-center text-lg font-medium text-white transition-[background-position] duration-300 group-hover:bg-right-top"
              >
                {group.title}
              </span>
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
