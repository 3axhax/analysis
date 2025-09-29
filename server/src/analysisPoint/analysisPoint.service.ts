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
    const points = await this.analysisPointRepository.findAll({
      include: { all: true },
    });
    return points.map((point) => {
      return {
        id: point.id,
        name: point.name,
        units: point.units.map((unit) => unit.name),
      };
    });
  }
  async getAnalysisPointByName(name: string): Promise<AnalysisPoint | null> {
    return this.analysisPointRepository.findOne({
      where: { name },
    });
  }
}
