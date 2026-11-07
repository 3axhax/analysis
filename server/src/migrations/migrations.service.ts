import { Injectable, OnModuleInit } from '@nestjs/common';
import { MedicalSource } from '../medicalSource/medical-source.model';
import { SourceReferenceInheritance } from '../medicalSource/source-reference-inheritance.model';
import { Sequelize } from 'sequelize-typescript';
import { MigrationsAnalysisPoint } from './migrations.analysisPoint';
import { MigrationsAges } from './migrations.ages';
import { MigrationsAnalysisResult } from './migrations.analysisResult';
import { runRecordedMigration } from './run-recorded-migration';
import { MEDICAL_SOURCE_SQL } from './medical-source-migration.sql';
import { MEDICAL_SOURCE_PARENT_SQL } from './medical-source-parent-migration.sql';
import { SOPPI_IRON_SOURCE_SQL } from './soppi-iron-source.sql';
import { NUTRITIONAL_IRON_SOURCE_SQL } from './nutritional-iron-source.sql';
import { IRON_SOURCE_THRESHOLDS_SQL } from './iron-source-thresholds.sql';
import { PMC_CLINICAL_DESCRIPTIONS_SQL } from './pmc-clinical-descriptions.sql';
import { MigrationsAnalysisPointUnits } from './migrations.analysisPointUnits';

@Injectable()
export class MigrationsService implements OnModuleInit {
  constructor(
    private readonly sequelize: Sequelize,
    private migrationsAnalysisPoint: MigrationsAnalysisPoint,
    private migrationsAges: MigrationsAges,
    private migrationsAnalysisResult: MigrationsAnalysisResult,
    private migrationsAnalysisPointUnits: MigrationsAnalysisPointUnits,
  ) {}

  async onModuleInit() {
    await this.runMigrations();
    // Register after DDL so Sequelize sync cannot create these tables before migration.
    this.sequelize.addModels([MedicalSource, SourceReferenceInheritance]);
  }

  private async runMigrations() {
    await this.sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await Promise.all(
      ['analysisPoint', 'ages', 'analysisResult'].map(async (model) => {
        switch (model) {
          case 'analysisPoint':
            await this.migrationsAnalysisPoint.addTranslationRuENParsingColumn();
            await this.migrationsAnalysisPoint.addPointHintRuENColumn();
            await this.migrationsAnalysisPoint.addParsingOrderColumn();
            break;
          case 'ages':
            await this.migrationsAges.addIntervalsColumn();
            break;
          case 'analysisResult':
            await this.migrationsAnalysisResult.addAgeInDaysColumn();
            break;
        }
      }),
    );
    // These depend on each other and must never be part of the parallel legacy batch.
    await this.migrationsAnalysisPointUnits.addUnitNormalization();
    await this.migrationsAnalysisPointUnits.addFerritinSourceUnit();
    await this.migrationsAnalysisResult.allowSourceOnlyMeasurements();
    await runRecordedMigration(
      this.sequelize,
      '0010-medical-sources',
      20010,
      MEDICAL_SOURCE_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0011-medical-source-parent-id',
      20011,
      MEDICAL_SOURCE_PARENT_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0012-soppi-iron-source',
      20012,
      SOPPI_IRON_SOURCE_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0013-nutritional-iron-source',
      20013,
      NUTRITIONAL_IRON_SOURCE_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0014-iron-source-thresholds',
      20014,
      IRON_SOURCE_THRESHOLDS_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0015-pmc-clinical-descriptions',
      20015,
      PMC_CLINICAL_DESCRIPTIONS_SQL,
    );
  }
}
