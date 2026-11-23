import { Link } from "react-router-dom";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { groupPath } from "@shared/catalog/article-routes.mjs";
import { ArticleCatalogState } from "./ArticleCatalogState";

export function ArticlesPage() {
  const { catalog, failed } = useArticleCatalog();
  if (!catalog) return <ArticleCatalogState failed={failed} />;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <h1 className="mb-4 text-3xl lg:text-4xl">Статьи</h1>
      <p className="mb-6">Узнайте, какие показатели входят в разные группы анализов.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {catalog.groups.map((group) => (
          <Link
            key={group.alias}
            to={groupPath(group.alias)}
            className="rounded-xl border border-cyan-600 bg-white p-5 text-cyan-700 transition-shadow hover:shadow-md dark:bg-gray-900 dark:text-cyan-200"
          >
            <span className="text-lg font-medium">{group.title}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
