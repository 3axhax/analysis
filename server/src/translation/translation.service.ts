import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Translation } from './translation.model';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationsResponse } from './translation.controller';

@Injectable()
export class TranslationService {
  constructor(
    @InjectModel(Translation)
    private translationRepository: typeof Translation,
  ) {}
  async getAll(): Promise<Translation[] | null> {
    return this.translationRepository.findAll({
      include: { all: true },
    });
  }

  async getTranslations({
    language,
    namespace,
  }: {
    language: LangValue;
    namespace: string;
  }): Promise<TranslationsResponse> {
    const translationDB = await this.translationRepository.findAll({
      where: {
        lang: language,
        namespace,
      },
    });
    const translation = {} as TranslationsResponse;
    translationDB.map((t: Translation) => {
      if (!t.submodule) {
        translation[t.module] = t.value;
      } else {
        if (!translation[t.module]) {
          translation[t.module] = {};
        }
        translation[t.module][t.submodule] = t.value;
      }
    });
    return translation;
  }
}
