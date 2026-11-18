import { Module } from '@nestjs/common';
import { IntervalAdminController } from './interval-admin.controller';
import { IntervalAdminService } from './interval-admin.service';
import { IntervalReaderService } from './interval-reader.service';
import { IntervalResultService } from './interval-result.service';
import { IntervalResultReadService } from './interval-result-read.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResult } from '../analysisResult/analysisResult.model';
import { AnalysisPointModule } from '../analysisPoint/analysisPoint.module';
import { AnalysisPointUnitsModule } from '../analysisPointUnits/analysisPointUnits.module';
import { UnitConversionModule } from '../unitConversion/unit-conversion.module';

/** Registered together with the completed migration and result cutover. */
@Module({
  imports: [
    SequelizeModule.forFeature([AnalysisResult]),
    AnalysisPointModule,
    AnalysisPointUnitsModule,
    UnitConversionModule,
  ],
  controllers: [IntervalAdminController],
  providers: [
    IntervalAdminService,
    IntervalReaderService,
    IntervalResultService,
    IntervalResultReadService,
  ],
  exports: [
    IntervalReaderService,
    IntervalResultService,
    IntervalResultReadService,
  ],
})
export class IntervalModule {}
