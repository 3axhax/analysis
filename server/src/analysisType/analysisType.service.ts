import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisType } from './analysisType.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';

@Injectable()
export class AnalysisTypeService {
  constructor(
    @InjectModel(AnalysisType)
    private analysisTypeRepository: typeof AnalysisType,
  ) {}
  async getAll() {
    return this.analysisTypeRepository.findAll({
      include: {
        model: AnalysisPoint,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    });
  }
}
