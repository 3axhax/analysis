import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisPointMaxValue } from './analysisPointMaxValue.model';
import { AnalysisPointMaxValueService } from './analysisPointMaxValue.service';

@Module({
  providers: [AnalysisPointMaxValueService],
  imports: [SequelizeModule.forFeature([AnalysisPointMaxValue])],
  exports: [AnalysisPointMaxValueService],
})
export class AnalysisPointMaxValueModule {}
