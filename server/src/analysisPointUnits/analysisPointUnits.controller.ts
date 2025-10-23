import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnalysisPointUnitsService } from './analysisPointUnits.service';
import { GetAnalysisPointUnitsListQueryDto } from './dto/analysisPointUnits.dto';

export interface AnalysisPointUnitsListResponse {
  totalRecord: number;
  currentPage: number;
  rows: {
    id: number;
    name: string;
    translationRu: string;
    translationEn: string;
  }[];
}

@Controller()
export class AnalysisPointUnitsController {
  constructor(private analysisPointUnitsService: AnalysisPointUnitsService) {}

  @Get('units')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAnalysisPointUnitsList(
    @Query() query: GetAnalysisPointUnitsListQueryDto,
  ): Promise<AnalysisPointUnitsListResponse> {
    return await this.analysisPointUnitsService.getAnalysisPointUnitsByQuery(
      query,
    );
  }

  /*  @Post('translations/add')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async addNewTranslation(
    @Body() param: AddNewTranslationQueryDto,
  ): Promise<Translation> {
    return this.translationService.addNewTranslation(param);
  }

  @Post('translations/edit')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async editTranslation(
    @Body() param: editTranslationQueryDto,
  ): Promise<Translation> {
    return this.translationService.editTranslation(param);
  }

  @Post('translations/delete')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteTranslation(@Body('id') id: number): Promise<any> {
    return this.translationService.deleteTranslation(id);
  }*/
}
