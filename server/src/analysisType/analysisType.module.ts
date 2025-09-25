import { Module } from '@nestjs/common';
import { AnalysisTypeController } from './analysisType.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisType } from './analysisType.model';
import { AnalysisTypeService } from './analysisType.service';
import { AnalysisTypePoint } from '../analysisPoint/analysisType-Point.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';

@Module({
  providers: [AnalysisTypeService],
  controllers: [AnalysisTypeController],
  imports: [
    SequelizeModule.forFeature([
      AnalysisType,
      AnalysisPoint,
      AnalysisTypePoint,
    ]),
  ],
  exports: [AnalysisTypeService],
})
export class AnalysisTypeModule {}
