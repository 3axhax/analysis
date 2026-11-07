import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Transaction } from 'sequelize';
import { normalizeSourceReference } from './source-reference-normalization';
import {
  normalizeToReference,
  ReferenceBound,
  UnitConversionRule,
  UnitNormalizationError,
} from './reference-normalization';

@Injectable()
export class UnitConversionService {
  constructor(private readonly db: Sequelize) {}
  async normalize(
    input: {
      pointId: number;
      ageId: number;
      genderId: number;
      sourceUnitId: number;
      sourceValue: string | number;
    },
    transaction?: Transaction,
    sourceId: number | null = null,
  ) {
    const options = {
      replacements: {
        pointId: input.pointId,
        ageId: input.ageId,
        genderId: input.genderId,
        sourceId,
      },
      transaction,
      type: QueryTypes.SELECT as const,
    };
    const [minimums, maximums, allowed, rules] = await Promise.all([
      this.db.query<ReferenceBound>(
        'SELECT "pointId","ageId","genderId","unitId",value::text AS value,"lowInclusive" FROM "analysisPointMinValue" WHERE "pointId"=:pointId AND "ageId"=:ageId AND "genderId"=:genderId AND "sourceId" IS NOT DISTINCT FROM :sourceId',
        options,
      ),
      this.db.query<ReferenceBound>(
        'SELECT "pointId","ageId","genderId","unitId",value::text AS value FROM "analysisPointMaxValue" WHERE "pointId"=:pointId AND "ageId"=:ageId AND "genderId"=:genderId AND "sourceId" IS NOT DISTINCT FROM :sourceId',
        options,
      ),
      this.db.query<{ unitsId: number }>(
        'SELECT "unitsId" FROM analysis_point_units WHERE "pointId"=:pointId',
        options,
      ),
      this.db.query<UnitConversionRule>(
        'SELECT id,"fromUnitId","toUnitId",coefficient::text AS coefficient,version,active,"pointId" FROM "unitConversionRule" WHERE active AND ("pointId" IS NULL OR "pointId"=:pointId)',
        options,
      ),
    ]);
    const normalization = {
      ...input,
      minimums,
      maximums,
      rules,
      allowedUnitIds: allowed.map((row) => row.unitsId),
    };
    return sourceId === null
      ? normalizeToReference(normalization)
      : normalizeSourceReference(normalization);
  }
  async sourceCatalog() {
    return this.db.query<{
      id: number;
      parentId: number | null;
      name: string;
      metadata: Record<string, unknown>;
    }>(
      'SELECT id, parent_id AS "parentId", name, metadata FROM "medicalSource" ORDER BY id',
      { type: QueryTypes.SELECT },
    );
  }
  async inherits(sourceId: number, pointId: number) {
    const rows = await this.db.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM "sourceReferenceInheritance" WHERE "sourceId"=:sourceId AND "pointId"=:pointId',
      { replacements: { sourceId, pointId }, type: QueryTypes.SELECT },
    );
    return rows[0].count === '1';
  }

  async normalizeForSource(
    input: {
      pointId: number;
      ageId: number;
      genderId: number;
      sourceUnitId: number;
      sourceValue: string | number;
    },
    sourceId: number,
  ) {
    const rows = await this.db.query<{ present: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "sourceId"=:sourceId AND "pointId"=:pointId AND "ageId"=:ageId AND "genderId"=:genderId UNION ALL SELECT 1 FROM "analysisPointMaxValue" WHERE "sourceId"=:sourceId AND "pointId"=:pointId AND "ageId"=:ageId AND "genderId"=:genderId) AS present`,
      { replacements: { ...input, sourceId }, type: QueryTypes.SELECT },
    );
    if (rows[0].present)
      return {
        reference: await this.normalize(input, undefined, sourceId),
        inherited: false,
      };
    if (await this.inherits(sourceId, input.pointId))
      return { reference: await this.normalize(input), inherited: true };
    throw new UnitNormalizationError('no_source_reference');
  }
}
