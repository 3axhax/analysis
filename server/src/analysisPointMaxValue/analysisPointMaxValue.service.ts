import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointMaxValue } from './analysisPointMaxValue.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { Op } from 'sequelize';

@Injectable()
export class AnalysisPointMaxValueService {
  constructor(
    @InjectModel(AnalysisPointMaxValue)
    private analysisPointMaxValueRepository: typeof AnalysisPointMaxValue,
  ) {}

  checkMaxValue = async ({
    pointData,
    ageId,
    genderId,
  }: {
    pointData: AnalysisResultPointData;
    ageId: number;
    genderId: number;
  }): Promise<boolean> => {
    const existMax = await this.analysisPointMaxValueRepository.findOne({
      where: {
        pointId: pointData.pointId,
        unitId: pointData.unitId,
        ageId,
        genderId,
        value: {
          [Op.lt]: pointData.value,
        },
      },
    });
    return !!existMax;
  };
}
