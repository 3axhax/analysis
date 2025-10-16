import { Controller, Get, Param } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { LangValue } from '../gender/lang-value.enum';

export interface TranslationsResponse {
  [key: string]:
    | string
    | {
        [key: string]: string;
      };
}

@Controller('i18n')
export class TranslationController {
  constructor(private translationService: TranslationService) {}
  @Get(':lng/:ns')
  async getTranslations(
    @Param('lng') language: LangValue,
    @Param('ns') namespace: string,
  ): Promise<TranslationsResponse> {
    return await this.translationService.getTranslations({
      language,
      namespace,
    });
  }
}
