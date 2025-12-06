import { Module } from '@nestjs/common';
import { AnalysisResultController } from './analysisResult.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultService } from './analysisResult.service';
import { AnalysisResult } from './analysisResult.model';
import { AgesModule } from '../ages/ages.module';
import { GenderModule } from '../gender/gender.module';
import { AnalysisPointModule } from '../analysisPoint/analysisPoint.module';
import { AnalysisPointUnitsModule } from '../analysisPointUnits/analysisPointUnits.module';
import { AnalysisResultPointDataModule } from '../analysisResultPointData/analysisResultPointData.module';
import { AnalysisResultDescriptionModule } from '../analysisResultDescription/analysisResultDescription.module';
import { AnalysisResultDescriptionConditionModule } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.module';
import { AnalysisPointMinValueModule } from '../analysisPointMinValue/analysisPointMinValue.module';
import { AnalysisPointMaxValueModule } from '../analysisPointMaxValue/analysisPointMaxValue.module';
import { ParseFileService } from './parseFile.service';

@Module({
  providers: [AnalysisResultService, ParseFileService],
  controllers: [AnalysisResultController],
  imports: [
    SequelizeModule.forFeature([AnalysisResult]),
    AgesModule,
    GenderModule,
    AnalysisPointModule,
    AnalysisPointUnitsModule,
    AnalysisResultPointDataModule,
    AnalysisResultDescriptionModule,
    AnalysisResultDescriptionConditionModule,
    AnalysisPointMinValueModule,
    AnalysisPointMaxValueModule,
  ],
  exports: [AnalysisResultService],
})
export class AnalysisResultModule {}
