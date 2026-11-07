import { Module } from '@nestjs/common';
import { MedicalSourceAdminController } from './medical-source-admin.controller';
import { MedicalSourceAdminService } from './medical-source-admin.service';
import { MedicalSourceCrudService } from './medical-source-crud.service';

@Module({
  controllers: [MedicalSourceAdminController],
  providers: [MedicalSourceAdminService, MedicalSourceCrudService],
  exports: [MedicalSourceAdminService],
})
export class MedicalSourceAdminModule {}
