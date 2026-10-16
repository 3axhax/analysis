import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AnalysisPointMaxValue,
  AnalysisPointMaxValueCreationAttrs,
} from './analysisPointMaxValue.model';
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
    unitId,
  }: {
    pointId: number;
    ageId: number;
    genderId: number;
    unitId: number;
  }): Promise<number | null> => {
    const foundValues = await this.analysisPointMaxValueRepository.findAll({
      where: { pointId, ageId, genderId, unitId },
    });

    return foundValues.length === 1 ? foundValues[0].value : null;
  };

  getMaxValueByParameters = async (
    parameters: Partial<AnalysisPointMaxValue>,
  ): Promise<AnalysisPointMaxValue[]> => {
    return this.analysisPointMaxValueRepository.findAll({
      where: parameters,
      include: [Gender, Age, AnalysisPointUnits],
    });
  };

  addNewPointMaxValue = async (
    parameters: AnalysisPointMaxValueCreationAttrs,
  ): Promise<AnalysisPointMaxValue> => {
    return this.analysisPointMaxValueRepository.create(parameters);
  };

  async deletePointMaxValueByParameters(
    parameters: Partial<AnalysisPointMaxValue>,
  ): Promise<boolean> {
    const deletedCount = await this.analysisPointMaxValueRepository.destroy({
      where: parameters,
    });

    return deletedCount > 0;
  }
}
