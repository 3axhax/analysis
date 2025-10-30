import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalysisPointService } from './analysisPoint.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnalysisPointUnitsListResponse } from '../analysisPointUnits/analysisPointUnits.controller';
import { GetAnalysisPointListQueryDto } from './dto/analysisPoint.dto';

@Controller('analysisPoint')
export class AnalysisPointController {
  constructor(private AnalysisPointService: AnalysisPointService) {}
  @Get()
  getAll() {
    return this.AnalysisPointService.getAll();
  }

  @Get('getFullList')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getFullAnalysisPointsList(
    @Query() query: GetAnalysisPointListQueryDto,
  ): Promise<AnalysisPointUnitsListResponse> {
    return await this.AnalysisPointService.getAnalysisPointByQuery(query);
  }
}
