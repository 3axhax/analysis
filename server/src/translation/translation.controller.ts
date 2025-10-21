import { Controller, Get, Param, Query } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { LangValue } from '../gender/lang-value.enum';
import { GetTranslationsListQueryDto } from './dto/translations.dto';
import { Translation } from './translation.model';

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
  async getTranslationsList(
    @Query() query: GetTranslationsListQueryDto,
  ): Promise<TranslationsListResponse> {
    return await this.translationService.getTranslationsByParameters(query);
  }
}
