import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPoint } from './analysisPoint.model';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationService } from '../translation/translation.service';
import {
  AddNewAnalysisPointQueryDto,
  GetAnalysisPointListQueryDto,
} from './dto/analysisPoint.dto';
import {
  AnalysisPointLimit,
  AnalysisPointsListResponse,
} from './analysisPoint.types';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';

@Injectable()
export class AnalysisPointService {
  namespace: string = 'entities';
  module: string = 'analysisPoint';
  constructor(
    @InjectModel(AnalysisPoint)
    private analysisPointRepository: typeof AnalysisPoint,
    private translationService: TranslationService,
    private analysisPointMaxValueService: AnalysisPointMaxValueService,
    private analysisPointMinValueService: AnalysisPointMinValueService,
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

    const rowsWithLimits = await Promise.all(
      rowsWithTranslation.map(async (row) => {
        const max =
          await this.analysisPointMaxValueService.getMaxValueByParameters({
            pointId: row.id,
          });
        const min =
          await this.analysisPointMinValueService.getMinValueByParameters({
            pointId: row.id,
          });
        return {
          ...row,
          limits: this._formatLimits(max, min),
        };
      }),
    );

    return {
      totalRecord: count,
      currentPage: parameters.currentPage,
      rows: rowsWithLimits,
    };
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
  ): Promise<void> {
    console.log(parameters);
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
    /*const [ru, en] = await Promise.all([
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
    ]);*/
    /*const limits = await Promise.all(parameters.limits.map());
    console.log(limits);*/
  }
}
