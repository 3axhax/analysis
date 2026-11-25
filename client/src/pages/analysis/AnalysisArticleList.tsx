import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { ArticlesIcon } from "@shared/ui/Icons/ArticlesIcon";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { groupImages } from "@shared/catalog/article-group-images";
import { groupPath, pointPath } from "@shared/catalog/article-routes.mjs";

const columnQueries = [
  "(min-width: 640px)",
  "(min-width: 768px)",
  "(min-width: 1280px)",
];
const subscribeToColumns = (onChange: () => void) => {
  const queries = columnQueries.map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () =>
    queries.forEach((query) => query.removeEventListener("change", onChange));
};
const getColumnCount = () =>
  window.matchMedia(columnQueries[2]).matches
    ? 6
    : window.matchMedia(columnQueries[1]).matches
      ? 3
      : window.matchMedia(columnQueries[0]).matches
        ? 2
        : 1;

export const AnalysisArticleList = () => {
  const { catalog, failed } = useArticleCatalog();
  const columnCount = useSyncExternalStore(
    subscribeToColumns,
    getColumnCount,
    () => 6,
  );
  const points = new Map(catalog?.points.map((point) => [point.id, point]));
  return (
    <section
      className="mb-5 lg:mb-8 lg:w-8/12 sm:w-full"
      id="article-list"
      aria-labelledby="article-list-title"
    >
      <h2
        id="article-list-title"
        className="text-[24px] font-light font-sans text-gray-900 dark:text-white mb-4"
      >
        <ArticlesIcon className="inline size-6 mr-1 mb-1" />
        Список статей
      </h2>
      {!catalog ? (
        <p role="status">
          {failed
            ? "Не удалось загрузить список статей."
            : "Загрузка списка статей…"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {Array.from({ length: columnCount }, (_, column) => (
            <div key={column} className="min-w-0 space-y-4">
              {catalog.groups
                .filter((_, index) => index % columnCount === column)
                .map((group) => (
                  <article
                    key={group.alias}
                    className="relative rounded-xl border border-cyan-600 bg-white dark:bg-gray-900 has-[details[open]]:z-20"
                    itemScope
                    itemType="https://schema.org/Article"
                  >
                    <Link
                      to={groupPath(group.alias)}
                      itemProp="url"
                      className="group block"
                      aria-label={group.title}
                    >
                      {groupImages[group.alias] && (
                        <img
                          src={groupImages[group.alias]}
                          alt=""
                          width={960}
                          height={640}
                          loading="lazy"
                          decoding="async"
                          itemProp="image"
                          className="aspect-[3/2] w-full rounded-t-xl object-cover"
                        />
                      )}
                    </Link>
                    <details className="group/subgroup relative">
                      <summary className="flex cursor-pointer list-none items-center gap-2 bg-gradient-to-br from-cyan-900 via-cyan-600 to-cyan-900 bg-[length:300%_100%] p-3 text-white rounded-b-xl group-open/subgroup:rounded-b-none [&::-webkit-details-marker]:hidden">
                        <h3
                          itemProp="headline"
                          className="flex-1 text-base font-medium"
                        >
                          <Link
                            className="bg-underline-hover"
                            to={groupPath(group.alias)}
                          >
                            {group.title}
                          </Link>
                        </h3>
                        <svg
                          aria-hidden="true"
                          className="size-5 shrink-0 transition-transform duration-300 group-open/subgroup:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <p className="absolute inset-x-0 top-full z-20 rounded-b-xl border border-t-0 border-cyan-600 bg-cyan-50 p-3 text-left text-sm text-gray-800 shadow-lg dark:bg-gray-900 dark:text-white">
                        {group.pointIds
                          .map((id) => points.get(id))
                          .filter((point) => point !== undefined)
                          .map((point, index) => (
                            <span key={point.id}>
                              {index > 0 && ", "}
                              <Link
                                className="bg-underline-hover"
                                to={pointPath(point.alias)}
                              >
                                {point.name}
                              </Link>
                            </span>
                          ))}
                      </p>
                    </details>
                  </article>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
