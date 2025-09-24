import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Age } from './ages/ages.model';
import { AgesModule } from './ages/ages.module';
import { AnalysisPoint } from './analysisPoint/analysisPoint.model';
import { AnalysisPointModule } from './analysisPoint/analysisPoint.module';

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
      models: [Age, AnalysisPoint],
      autoLoadModels: true,
    }),
    AgesModule,
    AnalysisPointModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
