import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationService } from '../translation/translation.service';
import {
  AddNewAnalysisPointQueryDto,
  EditAnalysisPointQueryDto,
  GetAnalysisPointListQueryDto,
} from './dto/analysisPoint.dto';
import {
  AnalysisPointLimit,
  AnalysisPointResponse,
  AnalysisPointsListResponse,
} from './analysisPoint.types';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';
import { AgesService } from '../ages/ages.service';
import { GenderService } from '../gender/gender.service';
import { AnalysisPointUnitsService } from '../analysisPointUnits/analysisPointUnits.service';
import { Op } from 'sequelize';

export interface AnalysisPointWithTranslation {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  parsingWords: string;
}

@Injectable()
export class AnalysisPointService {
  namespace: string = 'entities';
  module: string = 'analysisPoint';
  parsingSufix = '_parsing';
  constructor(
    @InjectModel(AnalysisPoint)
    private analysisPointRepository: typeof AnalysisPoint,
    private translationService: TranslationService,
    private analysisPointMaxValueService: AnalysisPointMaxValueService,
    private analysisPointMinValueService: AnalysisPointMinValueService,
    private agesService: AgesService,
    private genderService: GenderService,
    private unitsService: AnalysisPointUnitsService,
  ) {}
  async getAll() {
    const points = await this.analysisPointRepository.findAll({
      include: { all: true },
    });
    return points.map((point) => {
      return {
        id: point.id,
        name: point.name,
        units: point.units.map((unit) => unit.name),
      };
    });
  }

  async getAllWithTranslation() {
    const points = await this.analysisPointRepository.findAll({
      include: { all: true },
    });
    return await this.fillTranslation(points);
  }

  async fillTranslation(
    points: AnalysisPoint[],
  ): Promise<AnalysisPointWithTranslation[]> {
    return await Promise.all(
      points.map(async (point) => {
        const translations =
          await this.translationService.getTranslationsByParameters({
            namespace: this.namespace,
            module: this.module,
            submodule: point.name,
          });
        const ru = translations.find((t) => t.lang === LangValue.RU);
        const en = translations.find((t) => t.lang === LangValue.EN);

        const parsingTranslation =
          await this.translationService.getTranslationsByParameters({
            namespace: this.namespace,
            module: this.module,
            submodule: point.name + this.parsingSufix,
            lang: LangValue.RU,
          });
        return {
          ...point.dataValues,
          translationRu: ru ? ru.value : '',
          translationEn: en ? en.value : '',
          parsingWords:
            parsingTranslation && parsingTranslation.length > 0
              ? parsingTranslation[0].value
              : '',
        };
      }),
    );
  }

  async getAnalysisPointByName(name: string): Promise<AnalysisPoint | null> {
    return this.analysisPointRepository.findOne({
      where: { name },
    });
  }

  async getAnalysisPointByQuery(
    parameters: GetAnalysisPointListQueryDto,
  ): Promise<AnalysisPointsListResponse> {
    const { count, rows } = await this.analysisPointRepository.findAndCountAll({
      offset: (parameters.currentPage - 1) * parameters.recordPerPage,
      limit: parameters.recordPerPage,
      order: [['id', 'ASC']],
    });

    const rowsWithTranslation = await this.fillTranslation(rows);

    const rowsWithLimits = await Promise.all(
      rowsWithTranslation.map(async (row) => {
        const limits = await this._getLimitsForPointId(row.id);
        return {
          ...row,
          limits,
        };
      }),
    );

    return {
      totalRecord: count,
      currentPage: parameters.currentPage,
      rows: rowsWithLimits,
    };
  }

  async _addLimitsToPoint({
    limits,
    pointId,
  }: {
    limits: AnalysisPointLimit[];
    pointId: number;
  }): Promise<void> {
    await Promise.all(
      limits.map(async (limit) => {
        const [age, gender, unit] = await Promise.all([
          this.agesService.getAgeByName(limit.age),
          this.genderService.getGenderByName(limit.gender),
          this.unitsService.getAnalysisPointUnitsByName(limit.unit),
        ]);
        if (age && gender && unit) {
          await Promise.all([
            this.analysisPointMinValueService.addNewPointMinValue({
              pointId: pointId,
              ageId: age.id,
              genderId: gender.id,
              unitId: unit.id,
              value: limit.minValue,
            }),
            this.analysisPointMaxValueService.addNewPointMaxValue({
              pointId: pointId,
              ageId: age.id,
              genderId: gender.id,
              unitId: unit.id,
              value: limit.maxValue,
            }),
          ]);
        }
      }),
    );
  }

  async _getLimitsForPointId(pointId: number): Promise<AnalysisPointLimit[]> {
    const [max, min] = await Promise.all([
      this.analysisPointMaxValueService.getMaxValueByParameters({
        pointId,
      }),
      this.analysisPointMinValueService.getMinValueByParameters({
        pointId,
      }),
    ]);
    return this._formatLimits(max, min);
  }

  _formatLimits(
    maxList: AnalysisPointMaxValue[],
    minList: AnalysisPointMinValue[],
  ): AnalysisPointLimit[] {
    const limits: AnalysisPointLimit[] = [];
    maxList.map((max) => {
      const min = minList.find(
        (item) =>
          item.unitId === max.unitId &&
          item.ageId === max.ageId &&
          item.genderId === max.genderId,
      );
      limits.push({
        age: max.age.name,
        unit: max.unit.name,
        gender: max.gender.name,
        maxValue: max.value,
        minValue: min ? min.value : 0,
      });
      if (min) {
        minList = minList.filter((item) => item.id !== min.id);
      }
    });
    if (minList.length > 0) {
      minList.map((min) => {
        limits.push({
          age: min.age.name,
          unit: min.unit.name,
          gender: min.gender.name,
          maxValue: 0,
          minValue: min.value,
        });
      });
    }
    return limits;
  }

  async addNewAnalysisPoint(
    parameters: AddNewAnalysisPointQueryDto,
  ): Promise<AnalysisPointResponse> {
    const existingPoint = await this.analysisPointRepository.findOne({
      where: { name: parameters.name },
    });

    if (existingPoint) {
      throw new HttpException(
        `Analysis Point with name '${parameters.name}' already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const point = await this.analysisPointRepository.create({
      name: parameters.name,
    });
    if (!point) {
      throw new HttpException('Error in DB', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const [ru, en, parsing] = await Promise.all([
      parameters.translationRu !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.RU,
            namespace: this.namespace,
            module: this.module,
            submodule: point.name,
            value: parameters.translationRu,
          })
        : Promise.resolve(null),
      parameters.translationEn !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.EN,
            namespace: this.namespace,
            module: this.module,
            submodule: point.name,
            value: parameters.translationEn,
          })
        : Promise.resolve(null),
      parameters.parsingWords !== ''
        ? this.translationService.addNewTranslation({
            lang: LangValue.RU,
            namespace: this.namespace,
            module: this.module,
            submodule: point.name + this.parsingSufix,
            value: parameters.parsingWords,
          })
        : Promise.resolve(null),
    ]);
    await this._addLimitsToPoint({
      limits: parameters.limits,
      pointId: point.id,
    });
    const limits = await this._getLimitsForPointId(point.id);
    return {
      id: point.id,
      name: point.name,
      translationEn: ru ? ru.value : '',
      translationRu: en ? en.value : '',
      parsingWords: parsing ? parsing.value : '',
      limits,
    };
  }

  async editAnalysisPoint(
    parameters: EditAnalysisPointQueryDto,
  ): Promise<AnalysisPointResponse> {
    const existingPoint = await this.analysisPointRepository.findByPk(
      parameters.id,
    );

    if (!existingPoint) {
      throw new HttpException(
        `Analysis Point with id '${parameters.name}' not found`,
        HttpStatus.CONFLICT,
      );
    }

    const existingNamePoint = await this.analysisPointRepository.findOne({
      where: {
        name: parameters.name,
        id: { [Op.ne]: parameters.id },
      },
    });

    if (existingNamePoint) {
      throw new HttpException(
        `Point with name '${parameters.name}' already exists`,
        HttpStatus.CONFLICT,
      );
    }

    await existingPoint?.update(parameters);

    const [ru, en, parsing] = await Promise.all([
      parameters.translationRu !== ''
        ? this.translationService.editTranslationByParameters({
            lang: LangValue.RU,
            namespace: this.namespace,
            module: this.module,
            submodule: existingPoint.name,
            value: parameters.translationRu,
          })
        : Promise.resolve(null),
      parameters.translationEn !== ''
        ? this.translationService.editTranslationByParameters({
            lang: LangValue.EN,
            namespace: this.namespace,
            module: this.module,
            submodule: existingPoint.name,
            value: parameters.translationEn,
          })
        : Promise.resolve(null),
      parameters.parsingWords !== ''
        ? this.translationService.editTranslationByParameters({
            lang: LangValue.RU,
            namespace: this.namespace,
            module: this.module,
            submodule: existingPoint.name + this.parsingSufix,
            value: parameters.parsingWords,
          })
        : Promise.resolve(null),
    ]);

    await Promise.all([
      this.analysisPointMinValueService.deletePointMinValueByParameters({
        pointId: existingPoint.id,
      }),
      this.analysisPointMaxValueService.deletePointMaxValueByParameters({
        pointId: existingPoint.id,
      }),
    ]);

    await this._addLimitsToPoint({
      limits: parameters.limits,
      pointId: existingPoint.id,
    });
    const limits = await this._getLimitsForPointId(existingPoint.id);

    return {
      id: existingPoint.id,
      name: existingPoint.name,
      translationEn: ru ? ru.value : '',
      translationRu: en ? en.value : '',
      parsingWords: parsing ? parsing.value : '',
      limits,
    };
  }

  async deleteAnalysisPoint(id: number): Promise<boolean> {
    const existingPoint = await this.analysisPointRepository.findByPk(id);

    const deletedCount = await this.analysisPointRepository.destroy({
      where: { id },
    });

    if (existingPoint) {
      await Promise.all([
        this.translationService.deleteTranslationByParameters({
          lang: LangValue.RU,
          namespace: this.namespace,
          module: this.module,
          submodule: existingPoint.name,
        }),
        this.translationService.deleteTranslationByParameters({
          lang: LangValue.EN,
          namespace: this.namespace,
          module: this.module,
          submodule: existingPoint.name,
        }),
        this.analysisPointMinValueService.deletePointMinValueByParameters({
          pointId: existingPoint.id,
        }),
        this.analysisPointMaxValueService.deletePointMaxValueByParameters({
          pointId: existingPoint.id,
        }),
      ]);
    }

    return deletedCount > 0;
  }
}
