import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

@Injectable()
export class UnitConversionService {
  constructor(private readonly db: Sequelize) {}
  async sourceCatalog() {
    return this.db.query<{
      id: number;
      parentId: number | null;
      name: string;
      metadata: Record<string, unknown>;
      ageIds: number[] | null;
    }>(
      'SELECT s.id, s.parent_id AS "parentId", s.name, s.metadata, scope."ageIds" FROM "medicalSource" s LEFT JOIN LATERAL (SELECT array_agg(a."ageId" ORDER BY a."ageId") AS "ageIds" FROM "medicalSourceAge" a WHERE a."sourceId"=s.id) scope ON true ORDER BY s.id',
      { type: QueryTypes.SELECT },
    );
  }
}
