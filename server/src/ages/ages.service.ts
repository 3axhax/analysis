import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Age } from './ages.model';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationService } from '../translation/translation.service';
import {
  AddNewAgesQueryDto,
  EditAgesQueryDto,
  GetAgesListQueryDto,
} from './dto/ages.dto';
import { AgeResponse, AgesListResponse } from './ages.controller';
import { Op } from 'sequelize';

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

  async addNewAges(parameters: AddNewAgesQueryDto): Promise<AgeResponse> {
    const existingAge = await this.agesRepository.findOne({
      where: { name: parameters.name },
    });

    if (existingAge) {
      throw new HttpException(
        `Age with name '${parameters.name}' already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const age = await this.agesRepository.create({
      name: parameters.name,
    });
    if (!age) {
      throw new HttpException('Error in DB', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const [ru, en] = await Promise.all([
      parameters.translationRu !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.RU,
            namespace: this.namespace,
            module: this.module,
            submodule: age.name,
            value: parameters.translationRu,
          })
        : Promise.resolve(null),
      parameters.translationEn !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.EN,
            namespace: this.namespace,
            module: this.module,
            submodule: age.name,
            value: parameters.translationEn,
          })
        : Promise.resolve(null),
    ]);
    return {
      id: age.id,
      name: age.name,
      translationRu: ru ? ru.value : '',
      translationEn: en ? en.value : '',
    };
  }

  async editAges(parameters: EditAgesQueryDto): Promise<AgeResponse> {
    const existingAge = await this.agesRepository.findByPk(parameters.id);

    if (!existingAge) {
      throw new HttpException(
        `Age with id '${parameters.id}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingNameAge = await this.agesRepository.findOne({
      where: {
        name: parameters.name,
        id: { [Op.ne]: parameters.id },
      },
    });

    if (existingNameAge) {
      throw new HttpException(
        `Age with name '${parameters.name}' already exists`,
        HttpStatus.CONFLICT,
      );
    }

    await existingAge?.update(parameters);

    const [ru, en] = await Promise.all([
      this.translationService.editTranslationByParameters({
        lang: LangValue.RU,
        namespace: this.namespace,
        module: this.module,
        submodule: existingAge.name,
        value: parameters.translationRu,
      }),
      this.translationService.editTranslationByParameters({
        lang: LangValue.EN,
        namespace: this.namespace,
        module: this.module,
        submodule: existingAge.name,
        value: parameters.translationEn,
      }),
    ]);

    return {
      id: existingAge.id,
      name: existingAge.name,
      translationRu: ru ? ru.value : '',
      translationEn: en ? en.value : '',
    };
  }

  async deleteAges(id: number): Promise<boolean> {
    const existingAge = await this.agesRepository.findByPk(id);

    const deletedCount = await this.agesRepository.destroy({
      where: { id },
    });

    await Promise.all([
      this.translationService.deleteTranslationByParameters({
        lang: LangValue.RU,
        namespace: this.namespace,
        module: this.module,
        submodule: existingAge?.name,
      }),
      this.translationService.deleteTranslationByParameters({
        lang: LangValue.EN,
        namespace: this.namespace,
        module: this.module,
        submodule: existingAge?.name,
      }),
    ]);

    return deletedCount > 0;
  }
}
