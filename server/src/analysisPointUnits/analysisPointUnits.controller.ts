import { Controller, Post, Get, Query, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnalysisPointUnitsService } from './analysisPointUnits.service';
import {
  AddNewAnalysisPointUnitsQueryDto,
  EditAnalysisPointUnitsQueryDto,
  GetAnalysisPointUnitsListQueryDto,
} from './dto/analysisPointUnits.dto';

export interface AnalysisPointUnitResponse {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
}

export interface AnalysisPointUnitsListResponse {
  totalRecord: number;
  currentPage: number;
  rows: AnalysisPointUnitResponse[];
}

@Controller('units')
export class AnalysisPointUnitsController {
  constructor(private analysisPointUnitsService: AnalysisPointUnitsService) {}

  @Get()
  getAll() {
    return this.analysisPointUnitsService.getAll();
  }

  @Get('/withTranslations')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAnalysisPointUnitsList(
    @Query() query: GetAnalysisPointUnitsListQueryDto,
  ): Promise<AnalysisPointUnitsListResponse> {
    return await this.analysisPointUnitsService.getAnalysisPointUnitsByQuery(
      query,
    );
  }

  @Post('add')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async addNewAnalysisPointUnits(
    @Body() param: AddNewAnalysisPointUnitsQueryDto,
  ): Promise<AnalysisPointUnitResponse> {
    return this.analysisPointUnitsService.addNewAnalysisPointUnits(param);
  }

  @Post('edit')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async editAnalysisPointUnits(
    @Body() param: EditAnalysisPointUnitsQueryDto,
  ): Promise<AnalysisPointUnitResponse> {
    return this.analysisPointUnitsService.editAnalysisPointUnits(param);
  }

  @Post('delete')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteAnalysisPointUnits(@Body('id') id: number): Promise<boolean> {
    return this.analysisPointUnitsService.deleteAnalysisPointUnits(id);
  }
}
