import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultPointData } from './analysisResultPointData.model';
import { AnalysisResultPointDataService } from './analysisResultPointData.service';

@Module({
  providers: [AnalysisResultPointDataService],
  imports: [SequelizeModule.forFeature([AnalysisResultPointData])],
  exports: [AnalysisResultPointDataService],
})
export class AnalysisResultPointDataModule {}
