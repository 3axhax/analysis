import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { GetAnalysisResultDescriptionsListQueryDto } from './dto/analysisResultDescriptions.dto';

export interface AnalysisResultDescriptionResponse {
  id: number;
  description_ru: string;
}

export interface AnalysisResultDescriptionsListResponse {
  totalRecord: number;
  currentPage: number;
  rows: AnalysisResultDescriptionResponse[];
}

@Controller('descriptions')
export class AnalysisResultDescriptionsController {
  constructor(
    private analysisResultDescriptionService: AnalysisResultDescriptionService,
  ) {}

  @Get('/withTranslations')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAnalysisResultDescriptionsList(
    @Query() query: GetAnalysisResultDescriptionsListQueryDto,
  ): Promise<AnalysisResultDescriptionsListResponse> {
    return await this.analysisResultDescriptionService.getAnalysisResultDescriptionsByQuery(
      query,
    );
  }

  /*  @Post('add')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async addNewAnalysisResultDescriptions(
    @Body() param: AddNewAnalysisResultDescriptionsQueryDto,
  ): Promise<AnalysisResultDescriptionResponse> {
    return this.analysisResultDescriptionService.addNewAnalysisResultDescriptions(
      param,
    );
  }*/

  /*  @Post('edit')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async editAnalysisResultDescriptions(
    @Body() param: EditAnalysisResultDescriptionsQueryDto,
  ): Promise<AnalysisResultDescriptionResponse> {
    return this.analysisResultDescriptionService.editAnalysisResultDescriptions(
      param,
    );
  }*/

  /*  @Post('delete')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteAnalysisResultDescriptions(
    @Body('id') id: number,
  ): Promise<boolean> {
    return this.analysisResultDescriptionService.deleteAnalysisResultDescriptions(
      id,
    );
  }*/
}
