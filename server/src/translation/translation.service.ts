import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Translation } from './translation.model';
import { LangValue } from '../gender/lang-value.enum';
import {
  TranslationsListResponse,
  TranslationsResponse,
} from './translation.controller';
import {
  AddNewTranslationQueryDto,
  editTranslationQueryDto,
  GetTranslationsListQueryDto,
} from './dto/translations.dto';

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

  async getTranslationsByParameters(
    parameters: GetTranslationsListQueryDto,
  ): Promise<TranslationsListResponse> {
    const { count, rows } = await this.translationRepository.findAndCountAll({
      offset: (parameters.currentPage - 1) * parameters.recordPerPage,
      limit: parameters.recordPerPage,
      order: [['id', 'ASC']],
    });
    return {
      totalRecord: count,
      currentPage: parameters.currentPage,
      rows,
    };
  }

  async addNewTranslation(parameters: AddNewTranslationQueryDto) {
    return await this.translationRepository.create(parameters);
  }
  async editTranslation(parameters: editTranslationQueryDto) {
    const id = parameters.id;
    const translation = await this.translationRepository.findByPk(id);

    if (!translation) {
      throw new Error('Translation not found');
    }

    Object.assign(translation, parameters);
    return await translation.save();
  }

  async deleteTranslation(id: number) {
    const deletedCount = await this.translationRepository.destroy({
      where: { id },
    });

    return deletedCount > 0;
  }
}
