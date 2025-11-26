import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AnalysisPointService } from './analysisPoint.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AddNewAnalysisPointQueryDto,
  EditAnalysisPointQueryDto,
  GetAnalysisPointListQueryDto,
} from './dto/analysisPoint.dto';
import {
  AnalysisPointResponse,
  AnalysisPointsListResponse,
} from './analysisPoint.types';

@Controller('analysisPoint')
export class AnalysisPointController {
  constructor(private analysisPointService: AnalysisPointService) {}
  @Get()
  getAll() {
    return this.analysisPointService.getAll();
  }

  @Get('getFullList')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getFullAnalysisPointsList(
    @Query() query: GetAnalysisPointListQueryDto,
  ): Promise<AnalysisPointsListResponse> {
    return await this.analysisPointService.getAnalysisPointByQuery(query);
  }

  @Post('add')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async addNewAnalysisPoint(
    @Body() param: AddNewAnalysisPointQueryDto,
  ): Promise<AnalysisPointResponse> {
    return await this.analysisPointService.addNewAnalysisPoint(param);
  }

  @Post('edit')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async editAnalysisPoint(
    @Body() param: EditAnalysisPointQueryDto,
  ): Promise<AnalysisPointResponse> {
    return await this.analysisPointService.editAnalysisPoint(param);
  }

  @Post('delete')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteAnalysisPointUnits(@Body('id') id: number): Promise<boolean> {
    return this.analysisPointService.deleteAnalysisPoint(id);
  }
}
