import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AgesService } from './ages.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  //AddNewAgesQueryDto, EditAgesQueryDto,
  GetAgesListQueryDto,
} from './dto/ages.dto';

export interface AgeResponse {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
}

export interface AgesListResponse {
  totalRecord: number;
  currentPage: number;
  rows: AgeResponse[];
}

@Controller('ages')
export class AgesController {
  constructor(private AgesService: AgesService) {}
  @Get()
  getAll() {
    return this.AgesService.getAll();
  }

  @Get('/withTranslations')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAgesList(
    @Query() query: GetAgesListQueryDto,
  ): Promise<AgesListResponse> {
    return await this.AgesService.getAgesByQuery(query);
  }

  /*@Post('add')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async addNewAges(
      @Body() param: AddNewAgesQueryDto,
  ): Promise<AgeResponse> {
    return this.agesService.addNewAges(param);
  }

  @Post('edit')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async editAges(
      @Body() param: EditAgesQueryDto,
  ): Promise<AgeResponse> {
    return this.agesService.editAges(param);
  }

  @Post('delete')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteAges(@Body('id') id: number): Promise<boolean> {
    return this.agesService.deleteAges(id);
  }*/
}
