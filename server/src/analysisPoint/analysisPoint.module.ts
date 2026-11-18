import { Module } from '@nestjs/common';
import { AnalysisPointController } from './analysisPoint.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { AnalysisPointService } from './analysisPoint.service';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPointsUnits } from './analysisPoint-Units.model';
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
    AgesModule,
    GenderModule,
    AnalysisPointUnitsModule,
  ],
  exports: [AnalysisPointService],
})
export class AnalysisPointModule {}
