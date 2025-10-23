import { Global, Module } from '@nestjs/common';
import { TranslationController } from './translation.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Translation } from './translation.model';
import { TranslationService } from './translation.service';

@Global()
@Module({
  providers: [TranslationService],
  controllers: [TranslationController],
  imports: [SequelizeModule.forFeature([Translation])],
  exports: [TranslationService],
})
export class TranslationModule {}
