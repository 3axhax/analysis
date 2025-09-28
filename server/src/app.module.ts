import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Age } from './ages/ages.model';
import { AgesModule } from './ages/ages.module';
import { AnalysisPoint } from './analysisPoint/analysisPoint.model';
import { AnalysisPointModule } from './analysisPoint/analysisPoint.module';
import { AnalysisType } from './analysisType/analysisType.model';
import { AnalysisTypePoint } from './analysisPoint/analysisType-Point.model';
import { AnalysisTypeModule } from './analysisType/analysisType.module';
import { AnalysisPointUnits } from './analysisPoint/analysisPointUnits.model';
import { AnalysisPointsUnits } from './analysisPoint/analysisPoint-Units.model';
import { AnalysisResult } from './analysisResult/analysisResult.model';
import { AnalysisResultPointData } from './analysisResult/analysisResultPointData.model';
import { AnalysisResultModule } from './analysisResult/analysisResult.module';
import { Gender } from './gender/gender.model';
import { GenderModule } from './gender/gender.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [
        Age,
        AnalysisPoint,
        AnalysisType,
        AnalysisTypePoint,
        AnalysisPointUnits,
        AnalysisPointsUnits,
        AnalysisResult,
        AnalysisResultPointData,
        Gender,
      ],
      autoLoadModels: true,
    }),
    AgesModule,
    AnalysisPointModule,
    AnalysisTypeModule,
    AnalysisResultModule,
    GenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
