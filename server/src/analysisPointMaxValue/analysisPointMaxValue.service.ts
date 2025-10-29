import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointMaxValue } from './analysisPointMaxValue.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { Op } from 'sequelize';
import { Gender } from '../gender/gender.model';
import { Age } from '../ages/ages.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

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

  getMaxValueByPointGenderAge = async ({
    pointId,
    ageId,
    genderId,
  }: {
    pointId: number;
    ageId: number;
    genderId: number;
  }): Promise<number> => {
    const foundValue = await this.analysisPointMaxValueRepository.findOne({
      where: { pointId, ageId, genderId },
    });

    return foundValue ? foundValue.value : 0;
  };

  getMaxValueByParameters = async (
    parameters: Partial<AnalysisPointMaxValue>,
  ): Promise<AnalysisPointMaxValue[]> => {
    return this.analysisPointMaxValueRepository.findAll({
      where: parameters,
      include: [Gender, Age, AnalysisPointUnits],
    });
  };
}
