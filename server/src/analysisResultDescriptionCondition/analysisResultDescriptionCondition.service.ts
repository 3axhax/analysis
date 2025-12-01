import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  AnalysisResultDescriptionCondition,
  AnalysisResultDescriptionConditionAttrs,
} from './analysisResultDescriptionCondition.model';

@Injectable()
export class AnalysisResultDescriptionConditionService {
  constructor(
    @InjectModel(AnalysisResultDescriptionCondition)
    private analysisResultDescriptionConditionRepository: typeof AnalysisResultDescriptionCondition,
  ) {}

  addCondition = async (
    parameters: AnalysisResultDescriptionConditionAttrs,
  ) => {
    return await this.analysisResultDescriptionConditionRepository.create(
      parameters,
    );
  };

  deleteConditionByDescriptionId = async (descriptionId: number) => {
    return await this.analysisResultDescriptionConditionRepository.destroy({
      where: { descriptionId: descriptionId },
    });
  };
}
