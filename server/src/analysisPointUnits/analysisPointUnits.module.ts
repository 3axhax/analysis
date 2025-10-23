import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPointUnits } from './analysisPointUnits.model';
import { AnalysisPointUnitsService } from './analysisPointUnits.service';
import { AnalysisPointUnitsController } from './analysisPointUnits.controller';

@Module({
  providers: [AnalysisPointUnitsService],
  controllers: [AnalysisPointUnitsController],
  imports: [SequelizeModule.forFeature([AnalysisPointUnits])],
  exports: [AnalysisPointUnitsService],
})
export class AnalysisPointUnitsModule {}
