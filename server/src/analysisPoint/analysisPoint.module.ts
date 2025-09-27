import { Module } from '@nestjs/common';
import { AnalysisPointController } from './analysisPoint.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { AnalysisPointService } from './analysisPoint.service';
import { AnalysisPointUnits } from './analysisPointUnits.model';
import { AnalysisPointsUnits } from './analysisPoint-Units.model';

@Module({
  providers: [AnalysisPointService],
  controllers: [AnalysisPointController],
  imports: [
    SequelizeModule.forFeature([
      AnalysisPoint,
      AnalysisPointUnits,
      AnalysisPointsUnits,
    ]),
  ],
  exports: [AnalysisPointService],
})
export class AnalysisPointModule {}
