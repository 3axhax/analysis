import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UnitConversionRule } from '../unitConversion/reference-normalization';
import { IntervalMeasurement } from './interval-matcher';
import { sourceAppliesToAges } from '../analysisResult/source-age-scope';
import { ProjectionSource } from './interval-result-projection';
import { commonReference } from './interval-reference';
import { displayReferences } from './interval-display-references';
import {
  evaluateIntervals,
  IntervalDescription,
  IntervalInput,
  SourcedInterval,
} from './interval-evaluator';

/** Reads all sources before the caller applies its description source filter. */
@Injectable()
export class IntervalReaderService {
  constructor(private readonly db: Sequelize) {}

  async evaluate(
    measurements: readonly IntervalMeasurement[],
    sources: readonly ProjectionSource[],
  ) {
    const ageIds = [...new Set(measurements.flatMap((item) => item.ageIds))];
    if (!measurements.length || !ageIds.length)
      return {
        intervals: [],
        descriptions: [],
        warnings: [],
        references: [],
        displayReferences: [],
      };
    const pointIds = [
      ...new Set(measurements.map((measurement) => measurement.pointId)),
    ];
    const options = {
      replacements: { pointIds },
      type: QueryTypes.SELECT as const,
    };
    const [intervals, units, rules, descriptions, conditions] =
      await Promise.all([
        this.db.query<SourcedInterval>(
          'SELECT id,"sourceId","pointId","ageId","genderId","unitId","minValue"::text AS "minValue","maxValue"::text AS "maxValue","minValueEqual","maxValueEqual",status FROM "analysisPointIntervalValue" WHERE "pointId" IN (:pointIds) AND "ageId" IN (:ageIds)',
          { ...options, replacements: { pointIds, ageIds } },
        ),
        this.db.query<{ pointId: number; unitId: number }>(
          'SELECT "pointId","unitsId" AS "unitId" FROM analysis_point_units WHERE "pointId" IN (:pointIds)',
          options,
        ),
        this.db.query<UnitConversionRule>(
          'SELECT id,"fromUnitId","toUnitId",coefficient::text AS coefficient,version,active,"pointId" FROM "unitConversionRule" WHERE active AND ("pointId" IS NULL OR "pointId" IN (:pointIds))',
          options,
        ),
        this.db.query<{ id: number; sourceId: number | null }>(
          'SELECT id,"sourceId" FROM "analysisResultDescription"',
          { type: QueryTypes.SELECT },
        ),
        this.db.query<{
          descriptionId: number;
          conditionId: number;
          pointId: number;
          pointName: string;
          intervalId: number | null;
        }>(
          'SELECT c."descriptionId",c.id AS "conditionId",c."pointId",p.name AS "pointName",l."intervalId" FROM "analysisResultDescriptionCondition" c JOIN "analysisPoint" p ON p.id=c."pointId" LEFT JOIN "analysisResultIntervalDescriptionCondition" l ON l."conditionId"=c.id',
          { type: QueryTypes.SELECT },
        ),
      ]);
    const inputs: IntervalInput[] = measurements.map((measurement) => ({
      measurement,
      allowedUnitIds: units
        .filter((unit) => unit.pointId === measurement.pointId)
        .map((unit) => unit.unitId),
      rules,
    }));
    const publishedSourceIds = new Set(sources.map((source) => source.id));
    const byDescription = new Map<number, IntervalDescription>();
    for (const description of descriptions) {
      if (description.sourceId === null || publishedSourceIds.has(description.sourceId))
        byDescription.set(description.id, { ...description, conditions: [] });
    }
    const byCondition = new Map<
      number,
      {
        id: number;
        pointId: number;
        analysisPoint: { id: number; name: string };
        intervalIds: number[];
      }
    >();
    for (const row of conditions) {
      const description = byDescription.get(row.descriptionId);
      if (!description) continue;
      let condition = byCondition.get(row.conditionId);
      if (!condition) {
        condition = {
          id: row.conditionId,
          pointId: row.pointId,
          analysisPoint: { id: row.pointId, name: row.pointName },
          intervalIds: [],
        };
        byCondition.set(row.conditionId, condition);
        description.conditions.push(condition);
      }
      if (row.intervalId !== null) condition.intervalIds.push(row.intervalId);
    }
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    const applicableIntervals = intervals.filter((interval) => {
      if (interval.sourceId === null) return true;
      const source = sourceById.get(interval.sourceId);
      return (
        source !== undefined &&
        sourceAppliesToAges(source.ageIds, [interval.ageId])
      );
    });
    return {
      ...evaluateIntervals(inputs, applicableIntervals, [
        ...byDescription.values(),
      ]),
      references: inputs.map((input) => ({
        pointId: input.measurement.pointId,
        reference: commonReference(input, applicableIntervals),
      })),
      displayReferences: inputs.flatMap((input) =>
        displayReferences(input, applicableIntervals),
      ),
    };
  }
}
