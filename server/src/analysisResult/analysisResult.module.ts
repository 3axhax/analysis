import { Module } from '@nestjs/common';
import { AnalysisResultController } from './analysisResult.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { AnalysisResultService } from './analysisResult.service';
import { AnalysisResult } from './analysisResult.model';
import { Gender } from '../gender/gender.model';
import { Age } from '../ages/ages.model';
import { AgesService } from '../ages/ages.service';
import { GenderService } from '../gender/gender.service';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointService } from '../analysisPoint/analysisPoint.service';
import { AnalysisPointUnitsService } from '../analysisPointUnits/analysisPointUnits.service';
import { AnalysisResultPointDataService } from '../analysisResultPointData/analysisResultPointData.service';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { AnalysisResultDescriptionService } from '../analysisResultDescription/analysisResultDescription.service';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { AnalysisResultDescriptionConditionService } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.service';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';

@Module({
  providers: [
    AnalysisResultService,
    AgesService,
    GenderService,
    AnalysisPointService,
    AnalysisPointUnitsService,
    AnalysisResultPointDataService,
    AnalysisResultDescriptionService,
    AnalysisResultDescriptionConditionService,
    AnalysisPointMinValueService,
    AnalysisPointMaxValueService,
  ],
  controllers: [AnalysisResultController],
  imports: [
    SequelizeModule.forFeature([
      AnalysisResult,
      AnalysisResultPointData,
      Gender,
      Age,
      AnalysisPoint,
      AnalysisPointUnits,
      AnalysisResultDescription,
      AnalysisResultDescriptionCondition,
      AnalysisPointMinValue,
      AnalysisPointMaxValue,
    ]),
  ],
  exports: [AnalysisResultService],
})
export class AnalysisResultModule {}
