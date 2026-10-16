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

export interface SaveResultResponse {
  resultId?: string;
  error?: string;
}
export interface GetResultResponse {
  resultId?: string;
  error?: string;
  result?: ResultView | null;
  descriptions?: AnalysisResultDescription[];
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
    minValue: string;
    maxValue: string;
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
    const conditions: Record<number, StatusValue> = {};
    for (const [id, group] of statuses)
      if (group.size === 1 && !group.has(null)) conditions[id] = [...group][0]!;
    const descriptions =
      await this.analysisResultDescriptionService.getDescriptionsByConditions(
        conditions,
      );
    return { resultId: result.resultId, result: plain, descriptions };
  };
}
