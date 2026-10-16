import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Transaction } from 'sequelize';
import {
  normalizeToReference,
  ReferenceBound,
  UnitConversionRule,
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
  ) {
    const options = {
      replacements: {
        pointId: input.pointId,
        ageId: input.ageId,
        genderId: input.genderId,
      },
      transaction,
      type: QueryTypes.SELECT as const,
    };
    const [minimums, maximums, allowed, rules] = await Promise.all([
      this.db.query<ReferenceBound>(
        'SELECT "pointId","ageId","genderId","unitId",value::text AS value FROM "analysisPointMinValue" WHERE "pointId"=:pointId AND "ageId"=:ageId AND "genderId"=:genderId',
        options,
      ),
      this.db.query<ReferenceBound>(
        'SELECT "pointId","ageId","genderId","unitId",value::text AS value FROM "analysisPointMaxValue" WHERE "pointId"=:pointId AND "ageId"=:ageId AND "genderId"=:genderId',
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
    return normalizeToReference({
      ...input,
      minimums,
      maximums,
      rules,
      allowedUnitIds: allowed.map((row) => row.unitsId),
    });
  }
}
