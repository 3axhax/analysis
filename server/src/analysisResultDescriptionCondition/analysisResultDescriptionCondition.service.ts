import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisResultDescriptionCondition } from './analysisResultDescriptionCondition.model';

@Injectable()
export class AnalysisResultDescriptionConditionService {
  constructor(
    @InjectModel(AnalysisResultDescriptionCondition)
    private analysisResultDescriptionConditionRepository: typeof AnalysisResultDescriptionCondition,
  ) {}
}
