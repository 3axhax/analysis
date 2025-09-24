import { Module } from '@nestjs/common';
import { AnalysisPointController } from './analysisPoint.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { AnalysisPointService } from './analysisPoint.service';

@Module({
  providers: [AnalysisPointService],
  controllers: [AnalysisPointController],
  imports: [SequelizeModule.forFeature([AnalysisPoint])],
  exports: [AnalysisPointService],
})
export class AnalysisPointModule {}
