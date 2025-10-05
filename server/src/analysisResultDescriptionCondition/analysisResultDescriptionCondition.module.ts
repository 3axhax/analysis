import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultDescriptionConditionService } from './analysisResultDescriptionCondition.service';
import { AnalysisResultDescriptionCondition } from './analysisResultDescriptionCondition.model';

@Module({
  providers: [AnalysisResultDescriptionConditionService],
  imports: [SequelizeModule.forFeature([AnalysisResultDescriptionCondition])],
  exports: [AnalysisResultDescriptionConditionService],
})
export class AnalysisResultDescriptionConditionModule {}
