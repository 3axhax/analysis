import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointMinValue } from './analysisPointMinValue.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { Op } from 'sequelize';

@Injectable()
export class AnalysisPointMinValueService {
  constructor(
    @InjectModel(AnalysisPointMinValue)
    private analysisPointMinValueRepository: typeof AnalysisPointMinValue,
  ) {}

  checkMinValue = async ({
    pointData,
    ageId,
    genderId,
  }: {
    pointData: AnalysisResultPointData;
    ageId: number;
    genderId: number;
  }): Promise<boolean> => {
    const existMin = await this.analysisPointMinValueRepository.findOne({
      where: {
        pointId: pointData.pointId,
        unitId: pointData.unitId,
        ageId,
        genderId,
        value: {
          [Op.gt]: pointData.value,
        },
      },
    });

    return !!existMin;
  };
}
