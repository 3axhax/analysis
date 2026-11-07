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

  @Get('groups/:groupId/points')
  points(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.crud.listPoints(groupId);
  }

  @Get('groups/:groupId/descriptions')
  descriptions(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.crud.listDescriptions(groupId);
  }

  @Post('points/save')
  savePoint(
    @Body() input: Parameters<MedicalSourceCrudService['savePoint']>[0],
  ) {
    return this.crud.savePoint(input);
  }

  @Post('points/delete')
  deletePoint(
    @Body() input: Parameters<MedicalSourceCrudService['deletePoint']>[0],
  ) {
    return this.crud.deletePoint(input);
  }

  @Post('descriptions/save')
  saveDescription(
    @Body() input: Parameters<MedicalSourceCrudService['saveDescription']>[0],
  ) {
    return this.crud.saveDescription(input);
  }

  @Post('descriptions/delete')
  deleteDescription(
    @Body() input: Parameters<MedicalSourceCrudService['deleteDescription']>[0],
  ) {
    return this.crud.deleteDescription(input);
  }

  @Get(':sourceId/points')
  pointOptions(@Param('sourceId', ParseIntPipe) sourceId: number) {
    return this.sources.pointOptions(sourceId);
  }
}
