import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { runRecordedMigration } from './run-recorded-migration';
import {
  UNIT_NORMALIZATION_SQL,
  FERRITIN_SOURCE_UNIT_SQL,
} from './unit-migrations.sql';

@Injectable()
export class MigrationsAnalysisPointUnits {
  constructor(private readonly sequelize: Sequelize) {}

  async addUnitNormalization() {
    await runRecordedMigration(
      this.sequelize,
      '0002-unit-normalization',
      20002,
      UNIT_NORMALIZATION_SQL,
    );
  }

  async addFerritinSourceUnit() {
    await runRecordedMigration(
      this.sequelize,
      '0003-ferritin-source-unit',
      20003,
      FERRITIN_SOURCE_UNIT_SQL,
    );
  }
}
