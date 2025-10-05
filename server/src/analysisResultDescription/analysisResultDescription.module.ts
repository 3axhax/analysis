import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { AnalysisResultDescription } from './analysisResultDescription.model';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { AnalysisResultDescriptionConditionService } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.service';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';

@Module({
  providers: [
    AnalysisResultDescriptionService,
    AnalysisResultDescriptionConditionService,
    AnalysisPointMinValueService,
    AnalysisPointMaxValueService,
  ],
  imports: [
    SequelizeModule.forFeature([
      AnalysisResultDescription,
      AnalysisResultDescriptionCondition,
      AnalysisPointMinValue,
      AnalysisPointMaxValue,
    ]),
  ],
  exports: [AnalysisResultDescriptionService],
})
export class AnalysisResultDescriptionModule {}
