import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { AnalysisResult } from './analysisResult.model';
import * as crypto from 'crypto';
import { AgesService } from '../ages/ages.service';
import { GenderService } from '../gender/gender.service';
import { AnalysisPointService } from '../analysisPoint/analysisPoint.service';
import { AnalysisPointUnitsService } from '../analysisPointUnits/analysisPointUnits.service';
import { AnalysisResultPointDataService } from '../analysisResultPointData/analysisResultPointData.service';
import { AnalysisResultDescriptionService } from '../analysisResultDescription/analysisResultDescription.service';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { User } from '../users/users.model';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
import { UnitConversionService } from '../unitConversion/unit-conversion.service';
import {
  UnitNormalizationError,
  sourceMeasurementValue,
} from '../unitConversion/reference-normalization';
import {
  projectSavedMeasurement,
  isSourceOnlyMeasurement,
} from '../unitConversion/saved-measurement';
import { UnitAliasIndex } from '../unitConversion/unit-alias-index';
import { sourceAppliesToAge } from './source-age-scope';
import { calculateDeRitis } from './de-ritis';
import { calculateHoma } from './homa';
import { DE_RITIS_RULES, DeRitisRuleContext, matchesDeRitisRule } from './de-ritis-gradations';

export interface SaveResultResponse {
  resultId?: string;
  error?: string;
}
export interface GetResultResponse {
  resultId?: string;
  error?: string;
  result?: ResultView | null;
  descriptions?: AnalysisResultDescription[];
  sourceDescriptions?: Array<{
    source: {
      id: number;
      name: string;
      metadata: Record<string, unknown>;
      rootId: number;
      rootName: string;
    };
    descriptions: AnalysisResultDescription[];
    inheritedPointIds: number[];
  }>;
}
interface ResultPointView
  extends Omit<
    AnalysisResultPointData,
    'minValue' | 'maxValue' | 'pointDataStatus' | 'pointUnit'
  > {
  minValue: number | null;
  maxValue: number | null;
  pointDataStatus: StatusValue | null;
  pointUnit: { id: number; name: string };
  calculation?: {
    value: string;
    unitId: number;
    unit: string;
    coefficient: string;
    ruleId: number | null;
    ruleVersion: number | null;
    minValue: string | null;
    maxValue: string | null;
  };
  interpretationWarning?: string | null;
}
interface ResultView extends Omit<AnalysisResult, 'analysisResultPointData'> {
  analysisResultPointData: ResultPointView[];
}
export interface SourcePointInput {
  name: string;
  value: number | string;
  units: string;
  sourceUnitText?: string;
}

@Injectable()
export class AnalysisResultService {
  constructor(
    @InjectModel(AnalysisResult)
    private analysisResultRepository: typeof AnalysisResult,
    private agesService: AgesService,
    private genderService: GenderService,
    private analysisPointService: AnalysisPointService,
    private analysisPointUnitsService: AnalysisPointUnitsService,
    private analysisResultPointDataService: AnalysisResultPointDataService,
    private analysisResultDescriptionService: AnalysisResultDescriptionService,
    private unitConversionService: UnitConversionService,
  ) {}
  saveResult = async ({
    ageInDays,
    gender: genderName,
    pointData,
    user,
  }: {
    ageInDays: number;
    gender: string;
    pointData: SourcePointInput[];
    user: User | undefined;
  }): Promise<SaveResultResponse> => {
    if (
      !Number.isSafeInteger(ageInDays) ||
      ageInDays < 0 ||
      typeof genderName !== 'string' ||
      !Array.isArray(pointData) ||
      !pointData.length ||
      pointData.length > 200
    )
      throw new BadRequestException('invalid_result_input');
    const age = await this.agesService.getAgeByDays(ageInDays),
      gender = await this.genderService.getGenderByName(genderName);
    if (!age || !gender)
      throw new UnprocessableEntityException('invalid_age_or_gender');
    const allUnits = (await this.analysisPointUnitsService.getAll()) ?? [];
    const index = new UnitAliasIndex(allUnits);
    const db = this.analysisResultRepository.sequelize;
    if (!db) throw new Error('Database unavailable');
    try {
      return await db.transaction(
        { isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
        async (transaction) => {
          const seen = new Set<number>();
          const prepared = [] as {
            pointId: number;
            sourceUnitText: string;
            sourceUnitId: number;
            sourceValue: string;
          }[];
          for (const item of pointData) {
            if (
              !item ||
              typeof item.name !== 'string' ||
              item.name.length > 255 ||
              typeof item.units !== 'string' ||
              item.units.length > 128 ||
              (typeof item.value !== 'number' && typeof item.value !== 'string')
            )
              throw new UnitNormalizationError('invalid_point_input');
            const point =
                await this.analysisPointService.getAnalysisPointByName(
                  item.name,
                ),
              unit = allUnits.find((u) => u.name === item.units);
            if (!point || !unit)
              throw new UnitNormalizationError('unknown_point_or_unit');
            if (['de_ritis_ratio', 'homa_ir'].includes(point.name))
              throw new UnitNormalizationError('invalid_point_input');
            if (seen.has(point.id))
              throw new UnitNormalizationError('duplicate_point');
            seen.add(point.id);
            let sourceUnitText = unit.name;
            if (item.sourceUnitText !== undefined) {
              if (
                typeof item.sourceUnitText !== 'string' ||
                item.sourceUnitText.length > 128
              )
                throw new UnitNormalizationError('invalid_source_unit_text');
              if (
                index.resolve(item.sourceUnitText, [unit.id]).unit?.id ===
                unit.id
              )
                sourceUnitText = item.sourceUnitText;
            }
            prepared.push({
              pointId: point.id,
              sourceUnitText,
              sourceUnitId: unit.id,
              sourceValue: sourceMeasurementValue(item.value),
            });
          }
          const resultId = crypto.randomBytes(20).toString('hex');
          const result = await this.analysisResultRepository.create(
            {
              resultId,
              ageId: age.id,
              ageInDays,
              genderId: gender.id,
              userId: user?.id ?? null,
            },
            { transaction },
          );
          for (const {
            pointId,
            sourceUnitText,
            sourceUnitId,
            sourceValue,
          } of prepared)
            await this.analysisResultPointDataService.savePointData(
              {
                resultId: result.id,
                pointId,
                value: Number(sourceValue),
                unitId: sourceUnitId,
                sourceValue,
                sourceUnitId,
                sourceUnitText,
                calculationValue: null,
                conversionRuleId: null,
                conversionRuleVersion: null,
                appliedCoefficient: null,
                referenceMin: null,
                referenceMax: null,
              },
              transaction,
            );
          return { resultId: result.resultId };
        },
      );
    } catch (error) {
      if (error instanceof UnitNormalizationError)
        throw new UnprocessableEntityException(error.code);
      throw new ServiceUnavailableException('result_save_failed');
    }
  };
  getResultByResultId = async ({
    resultId,
  }: {
    resultId: string;
  }): Promise<GetResultResponse> => {
    try {
      return await this.readResult(resultId);
    } catch {
      throw new ServiceUnavailableException('result_read_failed');
    }
  };

  private readResult = async (resultId: string): Promise<GetResultResponse> => {
    const result = await this.analysisResultRepository.findOne({
      where: { resultId },
      include: [
        {
          model: AnalysisResultPointData,
          include: [{ model: AnalysisPoint }, { model: AnalysisPointUnits }],
        },
        { model: Age },
        { model: Gender },
      ],
    });
    if (!result) return { resultId, result: null, descriptions: [] };
    const plain = result.get({ plain: true }) as unknown as ResultView;
    const units = (await this.analysisPointUnitsService.getAll()) ?? [];
    const statuses = new Map<number, Set<StatusValue | null>>();
    plain.analysisResultPointData = await Promise.all(
      plain.analysisResultPointData.map(async (data) => {
        let status: StatusValue | null = null;
        let response: ResultPointView;
        try {
          const n =
            data.sourceValue !== null &&
            data.sourceValue !== undefined &&
            !isSourceOnlyMeasurement(data)
              ? projectSavedMeasurement(data, plain.ageId, plain.genderId)
              : await this.unitConversionService.normalize({
                  pointId: data.pointId,
                  ageId: plain.ageId,
                  genderId: plain.genderId,
                  sourceUnitId: data.sourceUnitId ?? data.unitId,
                  sourceValue: data.sourceValue ?? data.value,
                });
          const sourceUnit = units.find((u) => u.id === n.sourceUnitId);
          if (!sourceUnit)
            throw new UnitNormalizationError('unknown_source_unit');
          status = n.status;
          response = {
            ...data,
            value: Number(n.sourceValue),
            unitId: n.sourceUnitId,
            pointUnit: { id: sourceUnit.id, name: sourceUnit.name },
            sourceUnitText: data.sourceUnitText ?? sourceUnit.name,
            minValue: Number(n.displayMin),
            maxValue: Number(n.displayMax),
            pointDataStatus: status,
            calculation: {
              value: n.calculationValue,
              unitId: n.calculationUnitId,
              unit: units.find((unit) => unit.id === n.calculationUnitId)!.name,
              coefficient: n.appliedCoefficient,
              ruleId: n.conversionRuleId,
              ruleVersion: n.conversionRuleVersion,
              minValue: n.calculationMin,
              maxValue: n.calculationMax,
            },
            interpretationWarning: null,
          };
        } catch (error) {
          if (!(error instanceof UnitNormalizationError)) throw error;
          const sourceUnit = units.find(
            (unit) => unit.id === (data.sourceUnitId ?? data.unitId),
          );
          response = {
            ...data,
            value: Number(data.sourceValue ?? data.value),
            unitId: data.sourceUnitId ?? data.unitId,
            pointUnit: sourceUnit
              ? { id: sourceUnit.id, name: sourceUnit.name }
              : data.pointUnit,
            sourceUnitText: data.sourceUnitText ?? sourceUnit?.name ?? null,
            calculation: undefined,
            minValue: null,
            maxValue: null,
            pointDataStatus: null,
            interpretationWarning: error.code,
          };
        }
        const group =
          statuses.get(data.pointId) ?? new Set<StatusValue | null>();
        group.add(status);
        statuses.set(data.pointId, group);
        return response;
      }),
    );
    let deRitisContext: DeRitisRuleContext | undefined;
    // This is a derived point: it is never saved as an input measurement.
    const enzymeUnit = units.find((unit) => unit.name === 'unit/l');
    const ratioUnit = units.find((unit) => unit.name === 'без ед.');
    const ratio = enzymeUnit && ratioUnit
      ? calculateDeRitis(plain.analysisResultPointData, enzymeUnit.id)
      : null;
    if (ratio && ratioUnit) {
      const ratioPoint = await this.analysisPointService.getAnalysisPointByName('de_ritis_ratio');
      if (ratioPoint) {
        let status: StatusValue | null = null;
        let minimum: number | null = null;
        let maximum: number | null = null;
        let warning: string | null = null;
        try {
          const reference = await this.unitConversionService.normalize({
            pointId: ratioPoint.id, ageId: plain.ageId, genderId: plain.genderId,
            sourceUnitId: ratioUnit.id, sourceValue: ratio.sourceValue,
          });
          if (reference.displayMin === null || reference.displayMax === null)
            throw new UnitNormalizationError('incomplete_or_duplicate_reference_range');
          minimum = Number(reference.displayMin);
          maximum = Number(reference.displayMax);
          // Compare cross-products so rounding the quotient cannot change a boundary status.
          status = ratio.numerator.lt(ratio.denominator.times(reference.displayMin))
            ? StatusValue.LOW
            : ratio.numerator.gt(ratio.denominator.times(reference.displayMax))
              ? StatusValue.HIGH : StatusValue.NORMAL;
        } catch (error) {
          if (!(error instanceof UnitNormalizationError)) throw error;
          warning = error.code;
        }
        deRitisContext = { pointId: ratioPoint.id, numerator: ratio.numerator, denominator: ratio.denominator, status };
        let displayRatio = ratio.ratio.toDecimalPlaces(4);
        const roundedContext = { numerator: displayRatio, denominator: ratio.denominator.div(ratio.denominator) };
        if (Object.keys(DE_RITIS_RULES).some((key) => matchesDeRitisRule(key, ratio) !== matchesDeRitisRule(key, roundedContext)))
          displayRatio = ratio.ratio.toSignificantDigits(50);
        if (status !== null && minimum !== null && maximum !== null) {
          const displayedStatus = displayRatio.lt(minimum) ? StatusValue.LOW : displayRatio.gt(maximum) ? StatusValue.HIGH : StatusValue.NORMAL;
          if (displayedStatus !== status) displayRatio = ratio.ratio.toSignificantDigits(50);
        }
        const ratioData = {
          id: -ratioPoint.id, pointId: ratioPoint.id,
          point: typeof ratioPoint.get === 'function' ? ratioPoint.get({ plain: true }) : ratioPoint,
          value: Number(ratio.ratio.toSignificantDigits(12).toString()), displayValue: displayRatio.toFixed(),
          sourceValue: ratio.sourceValue, unitId: ratioUnit.id, sourceUnitId: ratioUnit.id,
          sourceUnitText: ratioUnit.name, pointUnit: { id: ratioUnit.id, name: ratioUnit.name },
          minValue: minimum, maxValue: maximum, pointDataStatus: status,
          interpretationWarning: warning, isCalculated: true,
        } as unknown as ResultPointView;
        plain.analysisResultPointData.push(ratioData);
        statuses.set(ratioPoint.id, new Set([status]));
      }
    }
    const glucoseUnit = units.find((unit) => unit.name === 'mmole/l');
    const insulinMilliUnit = units.find((unit) => unit.name === 'mUnit/l');
    const insulinMicroUnit = units.find((unit) => unit.name === 'mkUnit/l');
    const homa = glucoseUnit && insulinMilliUnit && insulinMicroUnit && ratioUnit
      ? calculateHoma(plain.analysisResultPointData, glucoseUnit.id, insulinMilliUnit.id, insulinMicroUnit.id) : null;
    if (homa && ratioUnit) {
      const homaPoint = await this.analysisPointService.getAnalysisPointByName('homa_ir');
      if (homaPoint) {
        let status: StatusValue | null = null, minimum: number | null = null, maximum: number | null = null;
        let warning: string | null = null;
        try {
          const ref = await this.unitConversionService.normalize({ pointId: homaPoint.id, ageId: plain.ageId, genderId: plain.genderId, sourceUnitId: ratioUnit.id, sourceValue: homa.sourceValue });
          if (ref.displayMin === null || ref.displayMax === null) throw new UnitNormalizationError('incomplete_or_duplicate_reference_range');
          minimum = Number(ref.displayMin); maximum = Number(ref.displayMax);
          status = homa.numerator.lt(homa.denominator.times(ref.displayMin)) ? StatusValue.LOW : homa.numerator.gt(homa.denominator.times(ref.displayMax)) ? StatusValue.HIGH : StatusValue.NORMAL;
        } catch (error) { if (!(error instanceof UnitNormalizationError)) throw error; warning = error.code; }
        let display = homa.ratio.toDecimalPlaces(4);
        if (status !== null && minimum !== null && maximum !== null && (display.lt(minimum) ? StatusValue.LOW : display.gt(maximum) ? StatusValue.HIGH : StatusValue.NORMAL) !== status) display = homa.ratio.toSignificantDigits(50);
        plain.analysisResultPointData.push({ id: -homaPoint.id, pointId: homaPoint.id, point: typeof homaPoint.get === 'function' ? homaPoint.get({ plain: true }) : homaPoint, value: Number(homa.ratio.toSignificantDigits(12).toString()), displayValue: display.toFixed(), sourceValue: homa.sourceValue, unitId: ratioUnit.id, sourceUnitId: ratioUnit.id, sourceUnitText: ratioUnit.name, pointUnit: { id: ratioUnit.id, name: ratioUnit.name }, minValue: minimum, maxValue: maximum, pointDataStatus: status, interpretationWarning: warning, isCalculated: true } as unknown as ResultPointView);
        statuses.set(homaPoint.id, new Set([status]));
      }
    }
    const conditions: Record<number, StatusValue> = {};
    for (const [id, group] of statuses)
      if (group.size === 1 && !group.has(null)) conditions[id] = [...group][0]!;
    const descriptions = deRitisContext
      ? await this.analysisResultDescriptionService.getDescriptionsByConditions(conditions, null, deRitisContext)
      : await this.analysisResultDescriptionService.getDescriptionsByConditions(conditions);
    const sourceDescriptions: NonNullable<
      GetResultResponse['sourceDescriptions']
    > = [];
    const sources = await this.unitConversionService.sourceCatalog();
    const allDescriptions = sources.length
      ? await this.analysisResultDescriptionService.getAllDescription()
      : [];
    const byId = new Map(sources.map((source) => [source.id, source]));
    for (const source of sources.filter((s) => s.parentId !== null)) {
      if (!sourceAppliesToAge(source.metadata, plain.ageId)) continue;
      const neededPointIds = new Set(
        allDescriptions.flatMap((description) => {
          const plainDescription = description.get({ plain: true });
          return plainDescription.sourceId === source.id
            ? plainDescription.analysisResultDescriptionConditions.map(
                (condition) => condition.pointId,
              )
            : [];
        }),
      );
      if (!neededPointIds.size) continue;
      let root = source;
      const visited = new Set<number>();
      while (root.parentId !== null) {
        if (visited.has(root.id) || !byId.has(root.parentId))
          throw new Error('invalid_source_hierarchy');
        visited.add(root.id);
        root = byId.get(root.parentId)!;
      }
      const perPoint = new Map<number, Set<StatusValue | null>>();
      const inheritedPointIds: number[] = [];
      for (const data of plain.analysisResultPointData.filter((point) =>
        neededPointIds.has(point.pointId),
      )) {
        let status: StatusValue | null = null;
        try {
          const normalized =
            await this.unitConversionService.normalizeForSource(
              {
                pointId: data.pointId,
                ageId: plain.ageId,
                genderId: plain.genderId,
                sourceUnitId: data.sourceUnitId ?? data.unitId,
                sourceValue: data.sourceValue ?? data.value,
              },
              source.id,
            );
          status = normalized.reference.status;
          if (normalized.inherited && !inheritedPointIds.includes(data.pointId))
            inheritedPointIds.push(data.pointId);
        } catch (error) {
          if (!(error instanceof UnitNormalizationError)) throw error;
        }
        const group =
          perPoint.get(data.pointId) ?? new Set<StatusValue | null>();
        group.add(status);
        perPoint.set(data.pointId, group);
      }
      const sourceConditions: Record<number, StatusValue> = {};
      for (const [id, group] of perPoint)
        if (group.size === 1 && !group.has(null))
          sourceConditions[id] = [...group][0]!;
      const sourceMatches =
        await this.analysisResultDescriptionService.getDescriptionsByConditions(
          sourceConditions,
          source.id,
        );
      if (sourceMatches.length)
        sourceDescriptions.push({
          source: {
            id: source.id,
            name: source.name,
            metadata: source.metadata,
            rootId: root.id,
            rootName: root.name,
          },
          descriptions: sourceMatches,
          inheritedPointIds,
        });
    }
    return {
      resultId: result.resultId,
      result: plain,
      descriptions,
      sourceDescriptions,
    };
  };
}
