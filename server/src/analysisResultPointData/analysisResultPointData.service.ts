import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AnalysisResultPointData,
  AnalysisResultPointDataAttrs,
} from './analysisResultPointData.model';
@Injectable()
export class AnalysisResultPointDataService {
  constructor(
    @InjectModel(AnalysisResultPointData)
    private analysisResultPointDataRepository: typeof AnalysisResultPointData,
  ) {}
  savePointData = async ({
    resultId,
    pointId,
    value,
    unitId,
  }: AnalysisResultPointDataAttrs): Promise<AnalysisResultPointData> => {
    return await this.analysisResultPointDataRepository.create({
      resultId,
      pointId,
      value,
      unitId,
    });
  };
}
