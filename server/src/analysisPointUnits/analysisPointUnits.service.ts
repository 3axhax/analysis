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
import { UnitAliasIndex } from '../unitConversion/unit-alias-index';

@Injectable()
export class AnalysisPointUnitsService {
  namespace: string = 'entities';
  module: string = 'units';

  constructor(
    @InjectModel(AnalysisPointUnits)
    private analysisPointUnitsRepository: typeof AnalysisPointUnits,
    private translationService: TranslationService,
  ) {}

  async getAll(): Promise<AnalysisPointUnits[] | null> {
    return this.analysisPointUnitsRepository.findAll({
      include: { all: true },
    });
  }

  private async validateParsing(
    parameters: AddNewAnalysisPointUnitsQueryDto,
    id?: number,
  ) {
    const units = await this.analysisPointUnitsRepository.findAll();
    const previous = units.find((unit) => unit.id === id);
    const candidate = {
      id: id ?? Math.max(0, ...units.map((unit) => unit.id)) + 1,
      name: parameters.name,
      code: parameters.code ?? previous?.code ?? null,
      translationParsing:
        parameters.translationParsing ?? previous?.translationParsing ?? '',
    };
    if (
      typeof candidate.name !== 'string' ||
      !candidate.name.trim() ||
      candidate.name.length > 255 ||
      typeof candidate.translationParsing !== 'string' ||
      candidate.translationParsing.length > 4096 ||
      (candidate.code !== null &&
        (typeof candidate.code !== 'string' ||
          !candidate.code.trim() ||
          candidate.code.length > 64))
    )
      throw new HttpException(
        'invalid_unit_definition',
        HttpStatus.BAD_REQUEST,
      );
    const index = new UnitAliasIndex([
      ...units.filter((unit) => unit.id !== id),
      candidate,
    ]);
    if (index.issues.some((issue) => issue.unitId === candidate.id))
      throw new HttpException(
        'conflicting_or_invalid_unit_parsing',
        HttpStatus.CONFLICT,
      );
    return candidate;
  }

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
    const definition = await this.validateParsing(parameters);
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
      code: definition.code,
      translationParsing: definition.translationParsing,
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
      code: unit.code,
      translationParsing: unit.translationParsing,
      translationRu: ru ? ru.value : '',
      translationEn: en ? en.value : '',
    };
  }

  async editAnalysisPointUnits(
    parameters: EditAnalysisPointUnitsQueryDto,
  ): Promise<AnalysisPointUnitResponse> {
    const definition = await this.validateParsing(parameters, parameters.id);
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

    await existingUnit.update({
      name: definition.name,
      code: definition.code,
      translationParsing: definition.translationParsing,
    });

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
      code: existingUnit.code,
      translationParsing: existingUnit.translationParsing,
      translationRu: ru ? ru.value : '',
      translationEn: en ? en.value : '',
    };
  }

  async deleteAnalysisPointUnits(id: number): Promise<boolean> {
    const existingUnit = await this.analysisPointUnitsRepository.findByPk(id);

    const deletedCount = await this.analysisPointUnitsRepository.destroy({
      where: { id },
    });

    await Promise.all([
      this.translationService.deleteTranslationByParameters({
        lang: LangValue.RU,
        namespace: this.namespace,
        module: this.module,
        submodule: existingUnit?.name,
      }),
      this.translationService.deleteTranslationByParameters({
        lang: LangValue.EN,
        namespace: this.namespace,
        module: this.module,
        submodule: existingUnit?.name,
      }),
    ]);

    return deletedCount > 0;
  }
}
