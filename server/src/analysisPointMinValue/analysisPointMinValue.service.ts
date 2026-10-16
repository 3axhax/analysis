import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AnalysisPointMinValue,
  AnalysisPointMinValueCreationAttrs,
} from './analysisPointMinValue.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { Op } from 'sequelize';
import { Gender } from '../gender/gender.model';
import { Age } from '../ages/ages.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

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

  getMinValueByPointGenderAge = async ({
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
    const foundValues = await this.analysisPointMinValueRepository.findAll({
      where: { pointId, ageId, genderId, unitId },
    });

    return foundValues.length === 1 ? foundValues[0].value : null;
  };

  getMinValueByParameters = async (
    parameters: Partial<AnalysisPointMinValue>,
  ): Promise<AnalysisPointMinValue[]> => {
    return this.analysisPointMinValueRepository.findAll({
      where: parameters,
      include: [Gender, Age, AnalysisPointUnits],
    });
  };

  addNewPointMinValue = async (
    parameters: AnalysisPointMinValueCreationAttrs,
  ): Promise<AnalysisPointMinValue> => {
    return this.analysisPointMinValueRepository.create(parameters);
  };

  async deletePointMinValueByParameters(
    parameters: Partial<AnalysisPointMinValue>,
  ): Promise<boolean> {
    const deletedCount = await this.analysisPointMinValueRepository.destroy({
      where: parameters,
    });

    return deletedCount > 0;
  }
}
