import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TranslationService } from './translation.service';
import { LangValue } from '../gender/lang-value.enum';
import {
  AddNewTranslationQueryDto,
  editTranslationQueryDto,
  GetTranslationsListQueryDto,
} from './dto/translations.dto';
import { Translation } from './translation.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';

export type TranslationsResponse = Record<
  string,
  string | Record<string, string>
>;

export interface TranslationsListResponse {
  totalRecord: number;
  currentPage: number;
  rows: Translation[];
}

@Controller()
export class TranslationController {
  constructor(private translationService: TranslationService) {}
  @Get('i18n/:lng/:ns')
  async getTranslations(
    @Param('lng') language: LangValue,
    @Param('ns') namespace: string,
  ): Promise<TranslationsResponse> {
    return await this.translationService.getTranslations({
      language,
      namespace,
    });
  }

  @Get('translations')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getTranslationsList(
    @Query() query: GetTranslationsListQueryDto,
  ): Promise<TranslationsListResponse> {
    return await this.translationService.getTranslationsByParameters(query);
  }

  @Post('translations/add')
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
  }
}
