import { Controller, Get, Param, Query } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { LangValue } from '../gender/lang-value.enum';
import { GetTranslationsListQueryDto } from './dto/translations.dto';

export type TranslationsResponse = Record<
  string,
  string | Record<string, string>
>;

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
  getTranslationsList(@Query() query: GetTranslationsListQueryDto) {
    console.log(query);
  }
}
