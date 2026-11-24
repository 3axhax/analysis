import { Link, useParams } from "react-router-dom";
import { NotFoundPage } from "@pages/404";
import { useArticleCatalog } from "@shared/catalog/article-catalog";
import { groupPath } from "@shared/catalog/article-routes.mjs";
import { ArticleBreadcrumbs } from "./ArticleBreadcrumbs";
import { ArticleCatalogState } from "./ArticleCatalogState";
import { ArticleInterpretations } from "./ArticleInterpretations";

export function AnalysisPointArticlePage() {
  const { slug } = useParams();
  const { catalog, failed } = useArticleCatalog();
  if (!catalog) return <ArticleCatalogState failed={failed} />;
  const point = catalog.points.find(({ alias }) => alias === slug);
  if (!point) return <NotFoundPage />;
  const groups = catalog.groups.filter(({ pointIds }) => pointIds.includes(point.id));

  const [description, sources] = (point.description ?? "").split(
    /^Источники[ \t]*\r?$/m,
    2,
  );
  const paragraphs = description.trim().split(/\r?\n(?:[ \t]*\r?\n)+/).filter(Boolean);
  const sourceLines = sources?.trim().split(/\r?\n/).filter(Boolean) ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 text-left">
      <ArticleBreadcrumbs title={point.name} />
      <h1 className="mb-6 text-3xl lg:text-4xl">{point.name}</h1>
      {paragraphs.length > 0 && (
        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => {
            const lines = paragraph.split(/\r?\n/);
            const listStart = lines.findIndex((line) => line.startsWith("- "));
            if (listStart >= 0 && lines.slice(listStart).every((line) => line.startsWith("- "))) {
              return (
                <div key={index} className="space-y-2 break-words">
                  {listStart > 0 && (
                    <p className="whitespace-pre-line indent-6">{lines.slice(0, listStart).join("\n")}</p>
                  )}
                  <ul className="ml-6 list-disc space-y-1 pl-5">
                    {lines.slice(listStart).map((line, lineIndex) => (
                      <li key={lineIndex}>{line.slice(2)}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            return <p key={index} className="whitespace-pre-line break-words indent-6">{paragraph}</p>;
          })}
        </div>
      )}
      {sourceLines.length > 0 && (
        <section className="mt-4 break-words" aria-label="Источники">
          <h2 className="font-medium">Источники</h2>
          <ul>
            {sourceLines.map((source, index) => {
              const url = source.trim();
              const isLink = URL.canParse(url) && new URL(url).protocol === "https:";
              return (
                <li key={index}>
                  {isLink ? (
                    <a className="text-cyan-600 underline" href={url} target="_blank" rel="noopener noreferrer">
                      {url}
                    </a>
                  ) : source}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <ArticleInterpretations key={point.id} pointId={point.id} points={catalog.points} />
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
