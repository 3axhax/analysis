import { Module } from '@nestjs/common';
import { AgesController } from './ages.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Age } from './ages.model';
import { AgesService } from './ages.service';

@Module({
  providers: [AgesService],
  controllers: [AgesController],
  imports: [SequelizeModule.forFeature([Age])],
  exports: [AgesService],
})
export class AgesModule {}
