import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { AnalysisResultDescription } from './analysisResultDescription.model';
import { AnalysisResultDescriptionsController } from './analysisResultDescription.controller';
import { AnalysisPointMaxValueModule } from '../analysisPointMaxValue/analysisPointMaxValue.module';
import { AnalysisPointMinValueModule } from '../analysisPointMinValue/analysisPointMinValue.module';
import { AnalysisResultDescriptionConditionModule } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.module';

@Module({
  providers: [AnalysisResultDescriptionService],
  controllers: [AnalysisResultDescriptionsController],
  imports: [
    SequelizeModule.forFeature([AnalysisResultDescription]),
    AnalysisPointMaxValueModule,
    AnalysisPointMinValueModule,
    AnalysisResultDescriptionConditionModule,
  ],
  exports: [AnalysisResultDescriptionService],
})
export class AnalysisResultDescriptionModule {}
