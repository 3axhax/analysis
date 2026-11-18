import { Module } from '@nestjs/common';
import { AnalysisResultController } from './analysisResult.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalysisResultService } from './analysisResult.service';
import { AnalysisResult } from './analysisResult.model';
import { AgesModule } from '../ages/ages.module';
import { GenderModule } from '../gender/gender.module';
import { AnalysisPointModule } from '../analysisPoint/analysisPoint.module';
import { AnalysisPointUnitsModule } from '../analysisPointUnits/analysisPointUnits.module';
import { AnalysisResultPointDataModule } from '../analysisResultPointData/analysisResultPointData.module';
import { ParseFileService } from './parseFile.service';
import { PdfParserModule } from '../pdf-parser/pdf-parser.module';
import { UnitConversionModule } from '../unitConversion/unit-conversion.module';
import { IntervalModule } from '../interval/interval.module';

@Module({
  providers: [AnalysisResultService, ParseFileService],
  controllers: [AnalysisResultController],
  imports: [
    IntervalModule,
    UnitConversionModule,
    SequelizeModule.forFeature([AnalysisResult]),
    AgesModule,
    GenderModule,
    AnalysisPointModule,
    AnalysisPointUnitsModule,
    AnalysisResultPointDataModule,
    PdfParserModule,
  ],
  exports: [AnalysisResultService],
})
export class AnalysisResultModule {}
