import { Module } from '@nestjs/common';
import { AnalysisResultController } from './analysisResult.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultPointData } from './analysisResultPointData.model';
import { AnalysisResultService } from './analysisResult.service';
import { AnalysisResult } from './analysisResult.model';
import { Gender } from '../gender/gender.model';
import { Age } from '../ages/ages.model';
import { AgesService } from '../ages/ages.service';
import { GenderService } from '../gender/gender.service';

@Module({
  providers: [AnalysisResultService, AgesService, GenderService],
  controllers: [AnalysisResultController],
  imports: [
    SequelizeModule.forFeature([
      AnalysisResult,
      AnalysisResultPointData,
      Gender,
      Age,
    ]),
  ],
  exports: [AnalysisResultService],
})
export class AnalysisResultModule {}
