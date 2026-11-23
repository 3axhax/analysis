import { Link, useParams } from "react-router-dom";
import { NotFoundPage } from "@pages/404";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { groupPath } from "@shared/catalog/article-routes.mjs";
import { ArticleBreadcrumbs } from "./ArticleBreadcrumbs";
import { ArticleCatalogState } from "./ArticleCatalogState";

export function AnalysisPointArticlePage() {
  const { slug } = useParams();
  const { catalog, failed } = useArticleCatalog();
  if (!catalog) return <ArticleCatalogState failed={failed} />;
  const point = catalog.points.find(({ alias }) => alias === slug);
  if (!point) return <NotFoundPage />;
  const groups = catalog.groups.filter(({ pointIds }) => pointIds.includes(point.id));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <ArticleBreadcrumbs title={point.name} />
      <h1 className="mb-6 text-3xl lg:text-4xl">{point.name}</h1>
      {point.description?.trim() && <p className="whitespace-pre-line">{point.description}</p>}
      {groups.length > 0 && (
        <nav aria-label="Разделы показателя" className="mt-6">
          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group.alias}><Link className="text-cyan-600 underline" to={groupPath(group.alias)}>{group.title}</Link></li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
