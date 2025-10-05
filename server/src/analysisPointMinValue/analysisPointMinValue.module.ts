import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPointMinValue } from './analysisPointMinValue.model';
import { AnalysisPointMinValueService } from './analysisPointMinValue.service';

@Module({
  providers: [AnalysisPointMinValueService],
  imports: [SequelizeModule.forFeature([AnalysisPointMinValue])],
  exports: [AnalysisPointMinValueService],
})
export class AnalysisPointMinValueModule {}
