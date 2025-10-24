import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointUnits } from './analysisPointUnits.model';
import {
  AddNewAnalysisPointUnitsQueryDto,
  EditAnalysisPointUnitsQueryDto,
  GetAnalysisPointUnitsListQueryDto,
} from './dto/analysisPointUnits.dto';
import {
  AnalysisPointUnitResponse,
  AnalysisPointUnitsListResponse,
} from './analysisPointUnits.controller';
import { TranslationService } from '../translation/translation.service';
import { LangValue } from '../gender/lang-value.enum';
import { Op } from 'sequelize';

@Injectable()
export class AnalysisPointUnitsService {
  namespace: string = 'entities';
  module: string = 'units';

  constructor(
    @InjectModel(AnalysisPointUnits)
    private analysisPointUnitsRepository: typeof AnalysisPointUnits,
    private translationService: TranslationService,
  ) {}

  async getAnalysisPointUnitsByName(
    name: string,
  ): Promise<AnalysisPointUnits | null> {
    return this.analysisPointUnitsRepository.findOne({
      where: { name },
    });
  }

  async getAnalysisPointUnitsByQuery(
    parameters: GetAnalysisPointUnitsListQueryDto,
  ): Promise<AnalysisPointUnitsListResponse> {
    const { count, rows } =
      await this.analysisPointUnitsRepository.findAndCountAll({
        offset: (parameters.currentPage - 1) * parameters.recordPerPage,
        limit: parameters.recordPerPage,
        order: [['id', 'ASC']],
      });

    const rowsWithTranslation = await Promise.all(
      rows.map(async (row) => {
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

  async addNewAnalysisPointUnits(
    parameters: AddNewAnalysisPointUnitsQueryDto,
  ): Promise<AnalysisPointUnitResponse> {
    const existingUnit = await this.analysisPointUnitsRepository.findOne({
      where: { name: parameters.name },
    });

    if (existingUnit) {
      throw new HttpException(
        `Unit with name '${parameters.name}' already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const unit = await this.analysisPointUnitsRepository.create({
      name: parameters.name,
    });
    if (!unit) {
      throw new HttpException('Error in DB', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const [ru, en] = await Promise.all([
      parameters.translationRu !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.RU,
            namespace: this.namespace,
            module: this.module,
            submodule: unit.name,
            value: parameters.translationRu,
          })
        : Promise.resolve(null),
      parameters.translationEn !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.EN,
            namespace: this.namespace,
            module: this.module,
            submodule: unit.name,
            value: parameters.translationEn,
          })
        : Promise.resolve(null),
    ]);
    return {
      id: unit.id,
      name: unit.name,
      translationRu: ru ? ru.value : '',
      translationEn: en ? en.value : '',
    };
  }

  async editAnalysisPointUnits(
    parameters: EditAnalysisPointUnitsQueryDto,
  ): Promise<AnalysisPointUnitResponse> {
    const existingUnit = await this.analysisPointUnitsRepository.findByPk(
      parameters.id,
    );

    if (!existingUnit) {
      throw new HttpException(
        `Unit with id '${parameters.id}' not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const existingNameUnit = await this.analysisPointUnitsRepository.findOne({
      where: {
        name: parameters.name,
        id: { [Op.ne]: parameters.id },
      },
    });

    if (existingNameUnit) {
      throw new HttpException(
        `Unit with name '${parameters.name}' already exists`,
        HttpStatus.CONFLICT,
      );
    }

    await existingUnit?.update(parameters);

    const [ru, en] = await Promise.all([
      this.translationService.editTranslationByParameters({
        lang: LangValue.RU,
        namespace: this.namespace,
        module: this.module,
        submodule: existingUnit.name,
        value: parameters.translationRu,
      }),
      this.translationService.editTranslationByParameters({
        lang: LangValue.EN,
        namespace: this.namespace,
        module: this.module,
        submodule: existingUnit.name,
        value: parameters.translationEn,
      }),
    ]);

    return {
      id: existingUnit.id,
      name: existingUnit.name,
      translationRu: ru ? ru.value : '',
      translationEn: en ? en.value : '',
    };
  }

  async deleteAnalysisPointUnits(id: number): Promise<boolean> {
    const existingUnit = await this.analysisPointUnitsRepository.findByPk(id);

    const deletedCount = await this.analysisPointUnitsRepository.destroy({
      where: { id },
    });

    console.log(existingUnit);
    console.log(existingUnit?.name);

    await Promise.all([
      this.translationService.editTranslationByParameters({
        lang: LangValue.RU,
        namespace: this.namespace,
        module: this.module,
        submodule: existingUnit?.name,
      }),
      this.translationService.editTranslationByParameters({
        lang: LangValue.EN,
        namespace: this.namespace,
        module: this.module,
        submodule: existingUnit?.name,
      }),
    ]);

    return deletedCount > 0;
  }
}
