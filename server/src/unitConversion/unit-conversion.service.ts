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
    }>(
      'SELECT id, parent_id AS "parentId", name, metadata FROM "medicalSource" ORDER BY id',
      { type: QueryTypes.SELECT },
    );
  }
}
