import { Module } from '@nestjs/common';
import { GenderController } from './gender.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { GenderService } from './gender.service';
import { Gender } from './gender.model';

@Module({
  providers: [GenderService],
  controllers: [GenderController],
  imports: [SequelizeModule.forFeature([Gender])],
  exports: [GenderService],
})
export class GenderModule {}
