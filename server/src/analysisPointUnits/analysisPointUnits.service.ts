import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointUnits } from './analysisPointUnits.model';

@Injectable()
export class AnalysisPointUnitsService {
  constructor(
    @InjectModel(AnalysisPointUnits)
    private analysisPointUnitsRepository: typeof AnalysisPointUnits,
  ) {}

  async getAnalysisPointUnitsByName(
    name: string,
  ): Promise<AnalysisPointUnits | null> {
    return this.analysisPointUnitsRepository.findOne({
      where: { name },
    });
  }
}
