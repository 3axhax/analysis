import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MedicalSourceAdminService } from './medical-source-admin.service';
import { MedicalSourceCrudService } from './medical-source-crud.service';

@Controller('admin/medical-sources')
@Roles('ADMIN')
@UseGuards(RolesGuard)
export class MedicalSourceAdminController {
  constructor(
    private readonly sources: MedicalSourceAdminService,
    private readonly crud: MedicalSourceCrudService,
  ) {}

  @Get()
  listSources() {
    return this.sources.listSources();
  }

  @Get('dictionaries')
  dictionaries() {
    return this.crud.dictionaries();
  }

  @Get('analysis-log')
  listAnalysisLog() {
    return this.sources.listAnalysisLog();
  }

}
