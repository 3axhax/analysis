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
      const units = [point.units];
      if (point.alt_units) {
        units.push(point.alt_units);
      }
      return {
        id: point.id,
        name: point.name,
        units: units,
      };
    });
  }
}
