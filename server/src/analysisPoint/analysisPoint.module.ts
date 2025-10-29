import { Module } from '@nestjs/common';
import { AnalysisPointController } from './analysisPoint.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { AnalysisPointService } from './analysisPoint.service';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPointsUnits } from './analysisPoint-Units.model';
import { AnalysisPointMaxValueModule } from '../analysisPointMaxValue/analysisPointMaxValue.module';
import { AnalysisPointMinValueModule } from '../analysisPointMinValue/analysisPointMinValue.module';

@Module({
  providers: [AnalysisPointService],
  controllers: [AnalysisPointController],
  imports: [
    SequelizeModule.forFeature([
      AnalysisPoint,
      AnalysisPointUnits,
      AnalysisPointsUnits,
    ]),
    AnalysisPointMaxValueModule,
    AnalysisPointMinValueModule,
  ],
  exports: [AnalysisPointService],
})
export class AnalysisPointModule {}
