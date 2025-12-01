import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisType } from './analysisType.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { GetAnalysisTypeListQueryDto } from './dto/analysisType.dto';
import { LangValue } from '../gender/lang-value.enum';
import { TranslationService } from '../translation/translation.service';
import { AnalysisTypeListResponse } from './analysisType.controller';

@Injectable()
export class AnalysisTypeService {
  namespace: string = 'entities';
  module: string = 'analysisType';

  constructor(
    @InjectModel(AnalysisType)
    private analysisTypeRepository: typeof AnalysisType,
    private translationService: TranslationService,
  ) {}
  async getAll() {
    return this.analysisTypeRepository.findAll({
      include: {
        model: AnalysisPoint,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    });
  }

  async getFullListWithPagination(
    parameters: GetAnalysisTypeListQueryDto,
  ): Promise<AnalysisTypeListResponse> {
    const { count, rows } = await this.analysisTypeRepository.findAndCountAll({
      offset: (parameters.currentPage - 1) * parameters.recordPerPage,
      limit: parameters.recordPerPage,
      order: [['id', 'ASC']],
      include: {
        model: AnalysisPoint,
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
      distinct: true,
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
}
