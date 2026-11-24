import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { AnalysisResult } from '../analysisResult/analysisResult.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointService } from '../analysisPoint/analysisPoint.service';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPointUnitsService } from '../analysisPointUnits/analysisPointUnits.service';
import { Gender } from '../gender/gender.model';
import { UnitConversionService } from '../unitConversion/unit-conversion.service';
import { sourceAppliesToAges } from '../analysisResult/source-age-scope';
import { calculateDeRitis, calculateResultRatio } from '../analysisResult/de-ritis';
import { calculateHoma } from '../analysisResult/homa';
import { IntervalMeasurement } from './interval-matcher';
import { IntervalResultService } from './interval-result.service';
import { SourcedInterval } from './interval-evaluator';
import { projectIntervalResult } from './interval-result-projection';
import Decimal from 'decimal.js';
import { sourceDetails } from '../medicalSource/source-details';

interface RawPoint {
  id: number;
  pointId: number;
  point: unknown;
  value: number;
  sourceValue: string | null;
  sourceUnitId: number | null;
  sourceUnitText: string | null;
  unitId: number;
  pointUnit?: { id: number; name: string };
  displayValue?: string;
  isCalculated?: boolean;
}
interface RawResult {
  ageInDays: number;
  genderId: number;
  analysisResultPointData: RawPoint[];
}
interface ResultPoint extends RawPoint {
  minValue: number | null;
  maxValue: number | null;
  pointDataStatus: string | null;
  interpretationWarning: string | null;
  calculation?: {
    value: string;
    unitId: number;
    unit: string;
    coefficient: string;
    ruleId: number | null;
    ruleVersion: number | null;
    minValue: string;
    maxValue: string;
  };
  matchingIntervals: (SourcedInterval & {
    unit: string | null;
    sourceName: string | null;
  })[];
  displayReferences?: (SourcedInterval & {
    source: ReturnType<typeof sourceDetails> | null;
  })[];
}
type ProjectedDescription = ReturnType<
  typeof projectIntervalResult
>['descriptions'][number];

function singleStatus(intervals: readonly SourcedInterval[]): string | null {
  const statuses = [
    ...new Set(
      intervals
        .map((interval) => interval.status)
        .filter((status) => status !== null),
    ),
  ];
  if (statuses.length !== 1) return null;
  return (
    (
      { LOW: '0', NORMAL: '-1', HIGH: '1', OPTIMUM: '2' } as Record<
        string,
        string
      >
    )[statuses[0]] ?? null
  );
}

/** Reads results through the interval model. */
@Injectable()
export class IntervalResultReadService {
  constructor(
    @InjectModel(AnalysisResult)
    private readonly results: typeof AnalysisResult,
    private readonly points: AnalysisPointService,
    private readonly units: AnalysisPointUnitsService,
    private readonly conversions: UnitConversionService,
    private readonly evaluator: IntervalResultService,
    private readonly db: Sequelize,
  ) {}

  async read(resultId: string) {
    const result = await this.results.findOne({
      where: { resultId },
      include: [
        {
          model: AnalysisResultPointData,
          include: [{ model: AnalysisPoint }, { model: AnalysisPointUnits }],
        },
        { model: Gender },
      ],
    });
    if (!result)
      return {
        resultId,
        result: null,
        descriptions: [],
        sourceDescriptions: [],
      };
    const plain = result.get({ plain: true }) as unknown as RawResult;
    const units = (await this.units.getAll()) ?? [];
    const unit = (name: string) => units.find((item) => item.name === name);
    const rows: ResultPoint[] = plain.analysisResultPointData.map((item) => {
      const unitId = item.sourceUnitId ?? item.unitId;
      const sourceUnit = units.find((value) => value.id === unitId);
      return {
        ...item,
        value: Number(item.sourceValue ?? item.value),
        displayValue: new Decimal(item.sourceValue ?? item.value).toFixed(),
        unitId,
        pointUnit: sourceUnit
          ? { id: sourceUnit.id, name: sourceUnit.name }
          : item.pointUnit,
        sourceUnitText: item.sourceUnitText ?? sourceUnit?.name ?? null,
        minValue: null,
        maxValue: null,
        pointDataStatus: null,
        calculation: undefined,
        interpretationWarning: null,
        matchingIntervals: [],
      };
    });
    const [sources, descriptions, matchingAges] = await Promise.all([
      this.conversions.sourceCatalog(),
      this.db.query<{ id: number; description_ru: string; alternativeToId: number | null }>(
        'SELECT id,description_ru,"alternativeToId" FROM "analysisResultDescription"',
        { type: QueryTypes.SELECT },
      ),
      this.db.query<{ id: number }>(
        'SELECT id FROM ages WHERE :ageInDays BETWEEN "intervalDayStart" AND "intervalDayEnd" ORDER BY id',
        { replacements: { ageInDays: plain.ageInDays }, type: QueryTypes.SELECT },
      ),
    ]);
    const ageIds = matchingAges.map((age) => age.id);

    const measurements: IntervalMeasurement[] = rows.map((row) => ({
      pointId: row.pointId,
      ageIds,
      genderId: plain.genderId,
      unitId: row.unitId,
      value: row.sourceValue ?? row.value,
    }));
    const ratioUnit = unit('без ед.');
    const enzymeUnit = unit('unit/l');
    const glucoseUnit = unit('mmole/l');
    const insulinMilliUnit = unit('mUnit/l');
    const insulinMicroUnit = unit('mkUnit/l');
    const ratio =
      ratioUnit && enzymeUnit ? calculateDeRitis(rows, enzymeUnit.id) : null;
    const homa =
      ratioUnit && glucoseUnit && insulinMilliUnit && insulinMicroUnit
        ? calculateHoma(
            rows,
            glucoseUnit.id,
            insulinMilliUnit.id,
            insulinMicroUnit.id,
          )
        : null;
    const countUnit = unit('10^9/l');
    const neutrophils = rows.find(
      (row) => (row.point as AnalysisPoint | null)?.name === 'neutrophil-count',
    );
    const lymphocytes = rows.find(
      (row) => (row.point as AnalysisPoint | null)?.name === 'lymphocyte-count',
    );
    const hasNlrReference = sources.some(
      (source) =>
        source.metadata.derivedPoint === 'nlr' &&
        sourceAppliesToAges(source.ageIds, ageIds),
    );
    const nlr =
      hasNlrReference &&
      countUnit && neutrophils && lymphocytes
        ? calculateResultRatio(rows, neutrophils.pointId, lymphocytes.pointId, countUnit.id)
        : null;
    for (const derived of [
      { name: 'de_ritis_ratio', value: ratio },
      { name: 'homa_ir', value: homa },
      { name: 'nlr', value: nlr },
    ]) {
      if (!derived.value || !ratioUnit) continue;
      const point = await this.points.getAnalysisPointByName(derived.name);
      if (!point) continue;
      const pointPlain =
        typeof point.get === 'function' ? point.get({ plain: true }) : point;
      const display = derived.value.ratio.toSignificantDigits(50).toFixed();
      rows.push({
        id: -point.id,
        pointId: point.id,
        point: pointPlain,
        value: Number(derived.value.ratio.toSignificantDigits(12).toString()),
        displayValue: display,
        sourceValue: derived.value.sourceValue,
        unitId: ratioUnit.id,
        sourceUnitId: ratioUnit.id,
        sourceUnitText: ratioUnit.name,
        pointUnit: { id: ratioUnit.id, name: ratioUnit.name },
        minValue: null,
        maxValue: null,
        pointDataStatus: null,
        interpretationWarning: null,
        matchingIntervals: [],
        isCalculated: true,
      });
      measurements.push({
        pointId: point.id,
        ageIds,
        genderId: plain.genderId,
        unitId: ratioUnit.id,
        value: derived.value.sourceValue,
        fraction: {
          numerator: derived.value.numerator.toFixed(),
          denominator: derived.value.denominator.toFixed(),
        },
      });
    }
    const evaluation = await this.evaluator.evaluate({
      ageIds,
      measurements,
      descriptions,
      sources,
    });
    const byPoint = new Map(
      evaluation.points.map((item) => [item.pointId, item.intervals]),
    );
    const references = new Map(
      evaluation.references.map((item) => [item.pointId, item.reference]),
    );
    for (const row of rows) {
      const reference = references.get(row.pointId);
      if (reference) {
        row.minValue = Number(reference.displayMin);
        row.maxValue = Number(reference.displayMax);
        const calculationUnit = units.find(
          (value) => value.id === reference.calculationUnitId,
        );
        if (calculationUnit)
          row.calculation = {
            value: reference.calculationValue,
            unitId: reference.calculationUnitId,
            unit: calculationUnit.name,
            coefficient: reference.appliedCoefficient,
            ruleId: reference.conversionRuleId,
            ruleVersion: reference.conversionRuleVersion,
            minValue: reference.calculationMin,
            maxValue: reference.calculationMax,
          };
      }
      row.matchingIntervals = (byPoint.get(row.pointId) ?? []).map(
        (interval) => ({
          ...interval,
          unit:
            units.find((value) => value.id === interval.unitId)?.name ?? null,
          sourceName:
            sources.find((value) => value.id === interval.sourceId)?.name ??
            null,
          source:
            interval.sourceId === null
              ? null
              : sourceDetails(interval.sourceId, sources),
        }),
      );
      row.displayReferences = evaluation.displayReferences
        .filter((interval) => interval.pointId === row.pointId)
        .map((interval) => ({
          ...interval,
          source:
            interval.sourceId === null
              ? null
              : sourceDetails(interval.sourceId, sources),
        }));
      // The presentation of multiple statuses remains a separate product decision.
      row.pointDataStatus = singleStatus(row.matchingIntervals);
    }
    const adaptDescription = (description: ProjectedDescription) => ({
      id: description.id,
      description_ru: description.description_ru,
      analysisResultDescriptionConditions: description.conditions.map(
        (condition) => ({
          ...condition,
          status: singleStatus(condition.intervals),
        }),
      ),
    });
    const sourceDescriptions = evaluation.sourceDescriptions.map((group) => ({
      ...group,
      descriptions: group.descriptions.map(adaptDescription),
      inheritedPointIds: [
        ...new Set(
          group.descriptions.flatMap((description) =>
            description.conditions
              .filter((condition) =>
                condition.intervals.some(
                  (interval) => interval.sourceId !== group.source.id,
                ),
              )
              .map((condition) => condition.pointId),
          ),
        ),
      ],
    }));
    return {
      resultId,
      result: { ...plain, analysisResultPointData: rows },
      descriptions: evaluation.descriptions.map(adaptDescription),
      sourceDescriptions,
    };
  }
}
