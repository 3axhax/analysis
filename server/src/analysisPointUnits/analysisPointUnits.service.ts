import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisPointUnits } from './analysisPointUnits.model';
import { GetAnalysisPointUnitsListQueryDto } from './dto/analysisPointUnits.dto';
import { AnalysisPointUnitsListResponse } from './analysisPointUnits.controller';
import { TranslationService } from '../translation/translation.service';
import { LangValue } from '../gender/lang-value.enum';

@Injectable()
export class AnalysisPointUnitsService {
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
            namespace: 'entities',
            module: 'units',
            submodule: row.name,
          });
        translations.map((t) => {
          console.log(t.lang, t.value);
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
