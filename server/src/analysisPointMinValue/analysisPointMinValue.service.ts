import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointMinValue } from './analysisPointMinValue.model';

@Injectable()
export class AnalysisPointMinValueService {
  constructor(
    @InjectModel(AnalysisPointMinValue)
    private analysisPointMinValueRepository: typeof AnalysisPointMinValue,
  ) {}
}
