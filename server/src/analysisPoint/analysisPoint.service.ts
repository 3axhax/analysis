import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';

@Injectable()
export class AnalysisPointService {
  constructor(
    @InjectModel(AnalysisPoint)
    private analysisPointRepository: typeof AnalysisPoint,
  ) {}
  async getAll() {
    return this.analysisPointRepository.findAll({
      include: { all: true },
    });
  }
}
