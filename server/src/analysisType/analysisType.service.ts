import { Op, QueryTypes } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisType } from './analysisType.model';
import { AnalysisPoint, calculatedAnalysisPointNames } from '../analysisPoint/analysisPoint.model';
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
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}
  async getAll() {
    return this.analysisTypeRepository.findAll({
      attributes: ['id', 'name'],
      order: [['articleOrder', 'ASC'], ['id', 'ASC']],
      include: {
        model: AnalysisPoint,
        attributes: ['id', 'name', 'translationRu', 'translationEn'],
        where: { name: { [Op.notIn]: calculatedAnalysisPointNames } },
        required: false,
        through: { attributes: [] },
      },
    });
  }

  async getArticleCatalog() {
    // Only project public catalog fields. Never serialize result or parsing models.
    const [catalog] = await this.sequelize.query<{ groups: unknown[]; points: unknown[] }>(
      `SELECT
        COALESCE((
          SELECT json_agg(json_build_object(
            'alias', t."urlAlias", 'title', COALESCE(labels.title, t.name),
            'pointIds', COALESCE(members.ids, '[]'::json)
          ) ORDER BY t."articleOrder", t.id)
          FROM "analysisType" t
          LEFT JOIN LATERAL (
            SELECT tr.value AS title FROM translation tr
            WHERE tr.namespace = 'entities' AND tr.module = 'analysisType'
              AND tr.submodule = t.name AND tr.lang = 'ru'
            ORDER BY tr.id LIMIT 1
          ) labels ON true
          LEFT JOIN LATERAL (
            SELECT json_agg(p.id ORDER BY link."articleOrder", p.id) AS ids
            FROM analysis_type_point link
            JOIN "analysisPoint" p ON p.id = link."pointId" AND p."urlAlias" IS NOT NULL
            WHERE link."typeId" = t.id
          ) members ON true
          WHERE t."urlAlias" IS NOT NULL
        ), '[]'::json) AS groups,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', p.id, 'alias', p."urlAlias",
            'name', COALESCE(NULLIF(p."translationRu", ''), p.name),
            'hint', p."pointHintRu", 'description', p."pointDescriptionRu"
          ) ORDER BY p.id)
          FROM "analysisPoint" p WHERE p."urlAlias" IS NOT NULL
        ), '[]'::json) AS points`,
      { type: QueryTypes.SELECT },
    );
    return catalog;
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
