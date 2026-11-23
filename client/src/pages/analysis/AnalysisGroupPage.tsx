import { Link, useParams } from "react-router-dom";
import { NotFoundPage } from "@pages/404";
import { ArticleBreadcrumbs } from "@pages/articles/ArticleBreadcrumbs";
import { ArticleCatalogState } from "@pages/articles/ArticleCatalogState";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { pointPath } from "@shared/catalog/article-routes.mjs";

export function AnalysisGroupPage() {
  const { slug } = useParams();
  const { catalog, failed } = useArticleCatalog();
  if (!catalog) return <ArticleCatalogState failed={failed} />;
  const group = catalog.groups.find(({ alias }) => alias === slug);
  if (!group) return <NotFoundPage />;
  const points = new Map(catalog.points.map((point) => [point.id, point]));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <ArticleBreadcrumbs title={group.title} />
      <h1 className="mb-6 text-3xl lg:text-4xl">{group.title}</h1>
      <div className="space-y-6">
        {group.pointIds.map((id) => {
          const point = points.get(id);
          if (!point) return null;
          return (
            <Link
              key={point.id}
              to={pointPath(point.alias)}
              className="block rounded-xl border border-cyan-600 p-5 hover:shadow-md"
            >
              <h2 className="text-2xl">{point.name}</h2>
              {point.hint?.trim() && <p className="mt-3 whitespace-pre-line">{point.hint}</p>}
            </Link>
          );
        })}
      </div>
      <Link className="mt-6 inline-block text-cyan-600 underline" to="/#analysis">Расшифровать анализы</Link>
    </main>
  );
}
