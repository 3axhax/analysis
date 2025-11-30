import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisResultDescription } from './analysisResultDescription.model';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { AnalysisResult } from '../analysisResult/analysisResult.model';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { GetAnalysisResultDescriptionsListQueryDto } from './dto/analysisResultDescriptions.dto';

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
          }
        },
      ),
    );
    return await this.getDescriptionsByConditions(pointStatus);
  };

  getDescriptionsByConditions = async (conditions: DescriptionConditions) => {
    const descriptions = await this.getAllDescription();

    return descriptions.filter((description) => {
      const plainDescription = description.get({ plain: true });
      if (plainDescription.analysisResultDescriptionConditions.length === 0)
        return false;
      return !plainDescription.analysisResultDescriptionConditions.find(
        (descriptionCondition) =>
          !conditions[descriptionCondition.pointId] ||
          conditions[descriptionCondition.pointId] !==
            descriptionCondition.status,
      );
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
    const { count, rows } =
      await this.analysisResultDescriptionRepository.findAndCountAll({
        offset: (parameters.currentPage - 1) * parameters.recordPerPage,
        limit: parameters.recordPerPage,
        order: [['id', 'ASC']],
        include: {
          model: AnalysisResultDescriptionCondition,
          include: [AnalysisPoint],
        },
        distinct: true,
        attributes: ['id', 'description_ru'],
      });

    return {
      totalRecord: count,
      currentPage: parameters.currentPage,
      rows: rows,
    };
  };
}
