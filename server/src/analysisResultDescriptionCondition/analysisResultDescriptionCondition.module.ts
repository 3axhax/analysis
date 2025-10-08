import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultDescriptionConditionService } from './analysisResultDescriptionCondition.service';
import { AnalysisResultDescriptionCondition } from './analysisResultDescriptionCondition.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';

@Module({
  providers: [AnalysisResultDescriptionConditionService],
  imports: [
    SequelizeModule.forFeature([
      AnalysisResultDescriptionCondition,
      AnalysisPoint,
    ]),
  ],
  exports: [AnalysisResultDescriptionConditionService],
})
export class AnalysisResultDescriptionConditionModule {}
