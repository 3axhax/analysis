import { useEffect, useState } from "react";
import type { ArticlePoint } from "@shared/catalog/article-catalog";
import { pointPath } from "@shared/catalog/article-routes.mjs";
import {
  AnalysisDescriptionList,
  type ArticleInterpretation,
} from "@widgets/analysisDescriptionList";

export function ArticleInterpretations({
  pointId,
  points,
}: {
  pointId: number;
  points: ArticlePoint[];
}) {
  const [interpretations, setInterpretations] = useState<ArticleInterpretation[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.VITE_BASE_API_URL}/analysisPoint/${pointId}/interpretations`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Interpretations unavailable");
        return response.json();
      })
      .then((data: ArticleInterpretation[]) => {
        if (!controller.signal.aborted) setInterpretations(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [pointId]);

  if (failed) return <p className="mt-6">Не удалось загрузить возможные интерпретации.</p>;
  if (!interpretations.length) return null;

  const pointLabels = new Map(points.map(({ id, name }) => [id, name]));
  const pointLinks = new Map(
    points.filter(({ id }) => id !== pointId).map(({ id, alias }) => [id, pointPath(alias)]),
  );

  const orderedInterpretations = interpretations.map((interpretation) => ({
    ...interpretation,
    analysisResultDescriptionConditions: [...interpretation.analysisResultDescriptionConditions].sort(
      (a, b) => Number(b.analysisPoint.id === pointId) - Number(a.analysisPoint.id === pointId),
    ),
  }));

  return (
    <section className="mt-8" aria-labelledby="possible-interpretations">
      <h2 id="possible-interpretations" className="mb-4 text-2xl">Возможные интерпретации</h2>
      <AnalysisDescriptionList
        articleInterpretations={orderedInterpretations}
        pointLabels={pointLabels}
        pointLinks={pointLinks}
      />
    </section>
  );
}
