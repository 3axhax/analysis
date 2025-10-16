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
import { AnalysisPointUnits } from './analysisPointUnits/analysisPointUnits.model';
import { AnalysisPointsUnits } from './analysisPoint/analysisPoint-Units.model';
import { AnalysisResult } from './analysisResult/analysisResult.model';
import { AnalysisResultPointData } from './analysisResultPointData/analysisResultPointData.model';
import { AnalysisResultModule } from './analysisResult/analysisResult.module';
import { Gender } from './gender/gender.model';
import { GenderModule } from './gender/gender.module';
import { AnalysisResultPointDataModule } from './analysisResultPointData/analysisResultPointData.module';
import { AnalysisPointMinValue } from './analysisPointMinValue/analysisPointMinValue.model';
import { AnalysisPointMinValueModule } from './analysisPointMinValue/analysisPointMinValue.module';
import { AnalysisPointMaxValue } from './analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPointMaxValueModule } from './analysisPointMaxValue/analysisPointMaxValue.module';
import { AnalysisResultDescriptionCondition } from './analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { AnalysisResultDescription } from './analysisResultDescription/analysisResultDescription.model';
import { AnalysisResultDescriptionModule } from './analysisResultDescription/analysisResultDescription.module';
import { AnalysisResultDescriptionConditionModule } from './analysisResultDescriptionCondition/analysisResultDescriptionCondition.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { UsersSessionsModule } from './users/usersSessions/usersSessions.module';
import { User } from './users/users.model';
import { Role } from './roles/roles.model';
import { UserRole } from './roles/users-roles.model';
import { UsersSessions } from './users/usersSessions/usersSessions.model';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TranslationModule } from './translation/translation.module';
import { Translation } from './translation/translation.model';

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
        Translation,
        User,
        Role,
        UserRole,
        UsersSessions,
        Age,
        AnalysisPoint,
        AnalysisType,
        AnalysisTypePoint,
        AnalysisPointUnits,
        AnalysisPointsUnits,
        AnalysisResult,
        AnalysisResultPointData,
        Gender,
        AnalysisPointMinValue,
        AnalysisPointMaxValue,
        AnalysisResultDescription,
        AnalysisResultDescriptionCondition,
      ],
      autoLoadModels: true,
    }),
    TranslationModule,
    UsersModule,
    RolesModule,
    AuthModule,
    UsersSessionsModule,
    AgesModule,
    AnalysisPointModule,
    AnalysisPointUnits,
    AnalysisTypeModule,
    AnalysisResultModule,
    AnalysisResultPointDataModule,
    GenderModule,
    AnalysisPointMinValueModule,
    AnalysisPointMaxValueModule,
    AnalysisResultDescriptionModule,
    AnalysisResultDescriptionConditionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
