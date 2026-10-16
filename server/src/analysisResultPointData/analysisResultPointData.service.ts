import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
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
  savePointData = async (
    data: AnalysisResultPointDataAttrs,
    transaction?: Transaction,
  ): Promise<AnalysisResultPointData> => {
    return await this.analysisResultPointDataRepository.create(data, {
      transaction,
    });
  };
}
