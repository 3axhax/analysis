import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order } from 'sequelize';
import { AnalysisResultDescription } from './analysisResultDescription.model';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { AnalysisResult } from '../analysisResult/analysisResult.model';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import {
  AddNewAnalysisResultDescriptionsQueryDto,
  EditAnalysisResultDescriptionsQueryDto,
  GetAnalysisResultDescriptionsListQueryDto,
} from './dto/analysisResultDescriptions.dto';
import { AnalysisResultDescriptionConditionService } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.service';
import { DeRitisRuleContext, matchesDeRitisRule } from '../analysisResult/de-ritis-gradations';

type DescriptionConditions = Record<number, StatusValue>;

@Injectable()
export class AnalysisResultDescriptionService {
  namespace: string = 'entities';
  module: string = 'units';

  constructor(
    @InjectModel(AnalysisResultDescription)
    private analysisResultDescriptionRepository: typeof AnalysisResultDescription,
    private analysisPointMinValueService: AnalysisPointMinValueService,
    private analysisPointMaxValueService: AnalysisPointMaxValueService,
    private analysisResultDescriptionConditionService: AnalysisResultDescriptionConditionService,
  ) {}

  getDescriptionByResult = async (result: AnalysisResult) => {
    const plainResult = result.get({ plain: true });
    const pointStatus = {} as DescriptionConditions;
    await Promise.all(
      plainResult.analysisResultPointData.map(
        async (data: AnalysisResultPointData) => {
          if (
            await this.analysisPointMinValueService.checkMinValue({
              pointData: data,
              ageId: result.ageId,
              genderId: result.genderId,
            })
          ) {
            pointStatus[data.pointId] = StatusValue.LOW;
          } else if (
            await this.analysisPointMaxValueService.checkMaxValue({
              pointData: data,
              ageId: result.ageId,
              genderId: result.genderId,
            })
          ) {
            pointStatus[data.pointId] = StatusValue.HIGH;
          } else {
            pointStatus[data.pointId] = StatusValue.NORMAL;
          }
        },
      ),
    );
    return await this.getDescriptionsByConditions(pointStatus);
  };

  getDescriptionsByConditions = async (
    conditions: DescriptionConditions,
    sourceId: number | null = null,
    deRitis?: DeRitisRuleContext,
  ) => {
    const descriptions = await this.getAllDescription();
    return descriptions.flatMap((description) => {
      const plainDescription = description.get({ plain: true });
      if ((plainDescription.sourceId ?? null) !== sourceId) return [];
      const ruleConditions = plainDescription.analysisResultDescriptionConditions;
      if (ruleConditions.length === 0) return [];
      if (plainDescription.deRitisRule) {
        // Numerical rules are independent of the coarse LOW/NORMAL/HIGH status.
        if (!deRitis || sourceId !== null || ruleConditions.length !== 1 ||
            ruleConditions[0].pointId !== deRitis.pointId ||
            !matchesDeRitisRule(plainDescription.deRitisRule, deRitis)) return [];
        plainDescription.analysisResultDescriptionConditions = ruleConditions.map((condition) => ({
          ...condition, status: deRitis.status,
        })) as typeof ruleConditions;
        return [plainDescription as unknown as AnalysisResultDescription];
      }
      return ruleConditions.some((condition) =>
        !conditions[condition.pointId] || conditions[condition.pointId] !== condition.status,
      ) ? [] : [description];
    });
  };

  getAllDescription = async () => {
    return await this.analysisResultDescriptionRepository.findAll({
      include: {
        model: AnalysisResultDescriptionCondition,
        include: [AnalysisPoint],
      },
    });
  };

  getAnalysisResultDescriptionsByQuery = async (
    parameters: GetAnalysisResultDescriptionsListQueryDto,
  ) => {
    const condition = {
      offset: (parameters.currentPage - 1) * parameters.recordPerPage,
      limit: parameters.recordPerPage,
      order: [['id', 'ASC']] as Order,
      include: {
        model: AnalysisResultDescriptionCondition,
        include: [AnalysisPoint],
      },
      distinct: true,
      attributes: ['id', 'description_ru', 'sourceId', 'deRitisRule'],
    };
    const pointFilter = Number(parameters.filters?.analysisPoint);
    if (parameters.filters?.analysisPoint && (!Number.isSafeInteger(pointFilter) || pointFilter < 1)) {
      throw new HttpException('Invalid analysis point filter', HttpStatus.BAD_REQUEST);
    }
    const where: Record<string, unknown> = { sourceId: null };
    if (pointFilter > 0) {
      const matches = await AnalysisResultDescriptionCondition.findAll({ where: { pointId: pointFilter }, attributes: ['descriptionId'] });
      where.id = { [Op.in]: matches.map((match) => match.descriptionId) };
    }
    condition['where'] = where;
    const { count, rows } =
      await this.analysisResultDescriptionRepository.findAndCountAll(condition);

    return {
      totalRecord: count,
      currentPage: parameters.currentPage,
      rows: rows,
    };
  };

  addNewAnalysisResultDescriptions = async (
    parameters: AddNewAnalysisResultDescriptionsQueryDto,
  ) => {
    const description = await this.analysisResultDescriptionRepository.create({
      description_ru: parameters.description_ru,
    });
    if (
      description &&
      parameters.analysisResultDescriptionConditions.length > 0
    ) {
      await Promise.all(
        parameters.analysisResultDescriptionConditions.map(
          async (condition) => {
            await this.analysisResultDescriptionConditionService.addCondition({
              descriptionId: description.id,
              pointId: condition.analysisPoint.id,
              status: condition.status,
            });
          },
        ),
      );
    }

    return await this.analysisResultDescriptionRepository.findOne({
      where: { id: description.id },
      include: {
        model: AnalysisResultDescriptionCondition,
        include: [AnalysisPoint],
      },
      attributes: ['id', 'description_ru'],
    });
  };

  editAnalysisResultDescriptions = async (
    parameters: EditAnalysisResultDescriptionsQueryDto,
  ) => {
    const existDescription =
      await this.analysisResultDescriptionRepository.findOne({
        where: { id: parameters.id, sourceId: null },
        include: {
          model: AnalysisResultDescriptionCondition,
          include: [AnalysisPoint],
        },
      });
    if (!existDescription) {
      throw new HttpException(
        `Description with id '${parameters.id}' not exists`,
        HttpStatus.CONFLICT,
      );
    }
    if (existDescription.deRitisRule) {
      const existing = existDescription.analysisResultDescriptionConditions;
      const supplied = parameters.analysisResultDescriptionConditions;
      if (existing.length !== 1 || supplied.length !== 1 ||
          supplied[0].analysisPoint?.id !== existing[0].pointId || supplied[0].status !== existing[0].status)
        throw new HttpException('de_ritis_rule_conditions_fixed', HttpStatus.BAD_REQUEST);
      await existDescription.update({ description_ru: parameters.description_ru });
      return await this.analysisResultDescriptionRepository.findOne({
        where: { id: existDescription.id },
        include: { model: AnalysisResultDescriptionCondition, include: [AnalysisPoint] },
        attributes: ['id', 'description_ru', 'deRitisRule'],
      });
    }
    await existDescription.update({ description_ru: parameters.description_ru });
    await this.analysisResultDescriptionConditionService.deleteConditionByDescriptionId(
      existDescription.id,
    );
    await Promise.all(
      parameters.analysisResultDescriptionConditions.map(async (condition) => {
        await this.analysisResultDescriptionConditionService.addCondition({
          descriptionId: existDescription.id,
          pointId: condition.analysisPoint.id,
          status: condition.status,
        });
      }),
    );

    return await this.analysisResultDescriptionRepository.findOne({
      where: { id: existDescription.id },
      include: {
        model: AnalysisResultDescriptionCondition,
        include: [AnalysisPoint],
      },
      attributes: ['id', 'description_ru'],
    });
  };

  deleteAnalysisResultDescriptions = async (descriptionId: number) => {
    const existDescription =
      await this.analysisResultDescriptionRepository.findOne({
        where: { id: descriptionId, sourceId: null },
        include: {
          model: AnalysisResultDescriptionCondition,
          include: [AnalysisPoint],
        },
      });
    if (existDescription) {
      await Promise.all([
        this.analysisResultDescriptionConditionService.deleteConditionByDescriptionId(
          existDescription.id,
        ),
        this.analysisResultDescriptionRepository.destroy({
          where: { id: existDescription.id },
        }),
      ]);
      return true;
    }
    return false;
  };
}
