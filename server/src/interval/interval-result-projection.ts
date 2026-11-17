import { sourceAppliesToAge } from '../analysisResult/source-age-scope';
import { IntervalDescription, SourcedInterval } from './interval-evaluator';

export interface ProjectionSource {
  id: number;
  parentId: number | null;
  name: string;
  metadata: Record<string, unknown>;
}
export interface ProjectionDescription extends IntervalDescription {
  description_ru: string;
}

/** Preserve all matching intervals and their provenance; status display is a separate decision. */
export function projectIntervalResult(
  ageId: number,
  pointIds: readonly number[],
  intervals: readonly SourcedInterval[],
  descriptions: readonly ProjectionDescription[],
  sources: readonly ProjectionSource[],
) {
  const points = pointIds.map((pointId) => ({
    pointId,
    intervals: intervals.filter((interval) => interval.pointId === pointId),
  }));
  const project = (description: ProjectionDescription) => ({
    ...description,
    conditions: description.conditions.map((condition) => ({
      ...condition,
      intervals: intervals.filter(
        (interval) =>
          interval.pointId === condition.pointId &&
          condition.intervalIds.includes(interval.id),
      ),
    })),
  });
  const byId = new Map(sources.map((source) => [source.id, source]));
  const sourceDescriptions = sources
    .filter(
      (source) =>
        source.parentId !== null && sourceAppliesToAge(source.metadata, ageId),
    )
    .flatMap((source) => {
      const matches = descriptions
        .filter((description) => description.sourceId === source.id)
        .map(project);
      if (!matches.length) return [];
      let root = source;
      const visited = new Set<number>();
      while (root.parentId !== null) {
        if (visited.has(root.id) || !byId.has(root.parentId))
          throw new Error('invalid_source_hierarchy');
        visited.add(root.id);
        root = byId.get(root.parentId)!;
      }
      return [
        {
          source: {
            id: source.id,
            name: source.name,
            metadata: source.metadata,
            rootId: root.id,
            rootName: root.name,
          },
          descriptions: matches,
        },
      ];
    });
  return {
    points,
    descriptions: descriptions
      .filter((description) => description.sourceId === null)
      .map(project),
    sourceDescriptions,
  };
}
