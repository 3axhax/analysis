import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Age } from './ages.model';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationService } from '../translation/translation.service';
import { GetAgesListQueryDto } from './dto/ages.dto';
import { AgesListResponse } from './ages.controller';

@Injectable()
export class AgesService {
  namespace: string = 'entities';
  module: string = 'ages';

  constructor(
    @InjectModel(Age)
    private agesRepository: typeof Age,
    private translationService: TranslationService,
  ) {}

  async getAll(): Promise<Age[] | null> {
    return this.agesRepository.findAll({
      include: { all: true },
    });
  }

  async getAgeByName(ageName: string): Promise<Age | null> {
    return this.agesRepository.findOne({
      where: { name: ageName },
    });
  }

  async getAgesByQuery(
    parameters: GetAgesListQueryDto,
  ): Promise<AgesListResponse> {
    const { count, rows } = await this.agesRepository.findAndCountAll({
      offset: (parameters.currentPage - 1) * parameters.recordPerPage,
      limit: parameters.recordPerPage,
      order: [['id', 'ASC']],
    });

    const rowsWithTranslation = await Promise.all(
      rows.map(async (row: Age) => {
        const translations =
          await this.translationService.getTranslationsByParameters({
            namespace: this.namespace,
            module: this.module,
            submodule: row.name,
          });
        const ru = translations.find((t) => t.lang === LangValue.RU);
        const en = translations.find((t) => t.lang === LangValue.EN);
        return {
          ...row.dataValues,
          translationRu: ru ? ru.value : '',
          translationEn: en ? en.value : '',
        };
      }),
    );

    return {
      totalRecord: count,
      currentPage: parameters.currentPage,
      rows: rowsWithTranslation,
    };
  }
}
