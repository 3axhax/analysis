import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { sourceDetails } from '../medicalSource/source-details';
import { UnitConversionService } from '../unitConversion/unit-conversion.service';

const statusValues = { LOW: '0', NORMAL: '-1', HIGH: '1', OPTIMUM: '2' } as const;

interface ArticleDescription {
  id: number;
  sourceId: number | null;
  description_ru: string;
  conditions: {
    id: number;
    analysisPoint: { id: number; name: string };
    statuses: (keyof typeof statusValues)[];
    inheritedSource: boolean;
    intervalIds: number[];
  }[];
}

export function aggregateArticleDescriptions(descriptions: ArticleDescription[]) {
  const groups = new Map<string, ArticleDescription[]>();
  for (const description of descriptions) {
    const points = description.conditions.map(({ analysisPoint }) => analysisPoint.id).sort((a, b) => a - b);
    const key = new Set(points).size === points.length
      ? JSON.stringify([description.sourceId, description.description_ru, points])
      : JSON.stringify([description.id]);
    const group = groups.get(key) ?? [];
    group.push(description);
    groups.set(key, group);
  }

  const merged = new Map<number, ArticleDescription>();
  const hidden = new Set<number>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const [first, ...rest] = group;
    const variantsByPoint = new Map(first.conditions.map(({ analysisPoint }) => [
      analysisPoint.id,
      new Map<string, ArticleDescription['conditions'][number]>(),
    ]));
    const combinations = new Set<string>();

    for (const description of group) {
      const combination = description.conditions.map((condition) => {
        const pointId = condition.analysisPoint.id;
        const variant = JSON.stringify(condition.intervalIds);
        variantsByPoint.get(pointId)!.set(variant, condition);
        return [pointId, variant] as const;
      }).sort(([a], [b]) => a - b);
      combinations.add(JSON.stringify(combination));
    }

    // Every stored combination is in the product. Equal counts prove there are no missing combinations.
    const productSize = [...variantsByPoint.values()].reduce((size, variants) => size * variants.size, 1);
    if (combinations.size !== productSize) continue;

    merged.set(first.id, {
      ...first,
      conditions: first.conditions.map((condition) => {
        const variants = [...variantsByPoint.get(condition.analysisPoint.id)!.values()];
        return {
          ...condition,
          statuses: [...new Set(variants.flatMap(({ statuses }) => statuses))].sort(),
          intervalIds: [...new Set(variants.flatMap(({ intervalIds }) => intervalIds))],
          inheritedSource: variants.some(({ inheritedSource }) => inheritedSource),
        };
      }),
    });
    for (const { id } of rest) hidden.add(id);
  }
  return descriptions.filter(({ id }) => !hidden.has(id)).map((description) => merged.get(description.id) ?? description);
}

@Injectable()
export class ArticleInterpretationsService {
  constructor(
    private readonly db: Sequelize,
    private readonly conversions: UnitConversionService,
  ) {}

  async getForPoint(pointId: number) {
    const [descriptions, sources] = await Promise.all([
      this.db.query<ArticleDescription>(
        `SELECT d.id, d."sourceId", d.description_ru,
                json_agg(json_build_object(
                  'id', c.id,
                  'analysisPoint', json_build_object('id', p.id, 'name', p.name),
                  'intervalIds', linked."intervalIds",
                  'statuses', COALESCE(linked.statuses, ARRAY[]::text[]),
                  'inheritedSource', linked."inheritedSource"
                ) ORDER BY c.id) AS conditions
         FROM "analysisResultDescription" d
         JOIN "analysisResultDescriptionCondition" c ON c."descriptionId" = d.id
         JOIN "analysisPoint" p ON p.id = c."pointId"
         CROSS JOIN LATERAL (
           SELECT array_agg(DISTINCT i.id ORDER BY i.id) AS "intervalIds",
                  array_agg(DISTINCT i.status::text ORDER BY i.status::text)
                    FILTER (WHERE i.status IS NOT NULL) AS statuses,
                  bool_or(i."sourceId" IS DISTINCT FROM d."sourceId") AS "inheritedSource",
                  count(*) AS total
           FROM "analysisResultIntervalDescriptionCondition" link
           JOIN "analysisPointIntervalValue" i ON i.id = link."intervalId" AND i."pointId" = c."pointId"
           WHERE link."conditionId" = c.id
         ) linked
         WHERE EXISTS (
           SELECT 1 FROM "analysisResultDescriptionCondition" target
           JOIN "analysisPoint" article ON article.id = target."pointId"
           WHERE target."descriptionId" = d.id AND article.id = :pointId AND article."urlAlias" IS NOT NULL
         )
         GROUP BY d.id
         HAVING bool_and(linked.total > 0)
         ORDER BY count(DISTINCT p.id), d.id`,
        { replacements: { pointId }, type: QueryTypes.SELECT },
      ),
      this.conversions.sourceCatalog(),
    ]);
    return aggregateArticleDescriptions(descriptions).flatMap(({ id, sourceId, description_ru, conditions }) => {
      const source = sourceId === null ? null : sourceDetails(sourceId, sources);
      if (sourceId !== null && !source) return [];
      return [{
        id,
        source,
        description_ru,
        analysisResultDescriptionConditions: conditions.map(({ id, analysisPoint, inheritedSource, statuses }) => ({
          id,
          analysisPoint,
          inheritedSource,
          statuses: statuses.map((status) => statusValues[status]),
        })),
      }];
    });
  }
}
