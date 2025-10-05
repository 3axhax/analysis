import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointMaxValue } from './analysisPointMaxValue.model';

@Injectable()
export class AnalysisPointMaxValueService {
  constructor(
    @InjectModel(AnalysisPointMaxValue)
    private analysisPointMaxValueRepository: typeof AnalysisPointMaxValue,
  ) {}
}
