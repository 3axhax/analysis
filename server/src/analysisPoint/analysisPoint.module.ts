import { Module } from '@nestjs/common';
import { AnalysisPointController } from './analysisPoint.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { AnalysisPointService } from './analysisPoint.service';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPointsUnits } from './analysisPoint-Units.model';
import { AnalysisPointMaxValueModule } from '../analysisPointMaxValue/analysisPointMaxValue.module';
import { AnalysisPointMinValueModule } from '../analysisPointMinValue/analysisPointMinValue.module';
import { AgesModule } from '../ages/ages.module';
import { GenderModule } from '../gender/gender.module';
import { AnalysisPointUnitsModule } from '../analysisPointUnits/analysisPointUnits.module';

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
    AgesModule,
    GenderModule,
    AnalysisPointUnitsModule,
  ],
  exports: [AnalysisPointService],
})
export class AnalysisPointModule {}
