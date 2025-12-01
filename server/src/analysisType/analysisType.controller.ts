import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalysisTypeService } from './analysisType.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { GetAnalysisTypeListQueryDto } from './dto/analysisType.dto';

export interface AnalysisTypeResponse {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
}

export interface AnalysisTypeListResponse {
  totalRecord: number;
  currentPage: number;
  rows: AnalysisTypeResponse[];
}

@Controller('analysisType')
export class AnalysisTypeController {
  constructor(private analysisTypeService: AnalysisTypeService) {}
  @Get()
  getAll() {
    return this.analysisTypeService.getAll();
  }

  @Get('/getFullList')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAnalysisResultDescriptionsList(
    @Query() query: GetAnalysisTypeListQueryDto,
  ): Promise<AnalysisTypeListResponse> {
    return await this.analysisTypeService.getFullListWithPagination(query);
  }
}
