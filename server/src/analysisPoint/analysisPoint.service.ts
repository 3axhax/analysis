import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPoint, calculatedAnalysisPointNames } from './analysisPoint.model';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationService } from '../translation/translation.service';
export interface AnalysisPointWithTranslation {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  parsingWords: string;
  parsingOrder: number;
  units?: Array<{
    id: number;
    name: string;
    code?: string | null;
    translationParsing?: string;
  }>;
}

@Injectable()
export class AnalysisPointService {
  namespace: string = 'entities';
  module: string = 'analysisPoint';
  constructor(
    @InjectModel(AnalysisPoint)
    private analysisPointRepository: typeof AnalysisPoint,
    private translationService: TranslationService,
  ) {}
  async getAll() {
    const points = await this.analysisPointRepository.findAll({
      include: { all: true },
      order: [['translationRu', 'ASC']],
    });
    return points.filter((point) => !calculatedAnalysisPointNames.includes(point.name)).map((point) => {
      return {
        id: point.id,
        name: point.name,
        translationRu: point.translationRu,
        translationEn: point.translationEn,
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

        return {
          ...point.dataValues,
          translationRu: ru ? ru.value : '',
          translationEn: en ? en.value : '',
          parsingWords: point.translationParsing ?? '',
        };
      }),
    );
  }

  async getAnalysisPointByName(name: string): Promise<AnalysisPoint | null> {
    return this.analysisPointRepository.findOne({
      where: { name },
    });
  }

}
