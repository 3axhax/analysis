import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPointUnits } from './analysisPointUnits.model';
import { AnalysisPointUnitsService } from './analysisPointUnits.service';

@Module({
  providers: [AnalysisPointUnitsService],
  imports: [SequelizeModule.forFeature([AnalysisPointUnits])],
  exports: [AnalysisPointUnitsService],
})
export class AnalysisPointUnitsModule {}
