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
import { METHOD45_UNIT_CORRECTION_SQL } from './method45-unit-correction.sql';
import { METHOD45_REFERENCE_CORRECTION_SQL } from './method45-reference-correction.sql';
import { CBC_MISSING_REFERENCE_SQL } from './cbc-missing-reference.sql';
import { CBC_REFERENCE_DESCRIPTION_CORRECTION_SQL } from './cbc-reference-description-correction.sql';
import { CBC_BOUNDARY_CORRECTION_SQL } from './cbc-boundary-correction.sql';
import { CBC_AGE_GROUPS_SQL } from './cbc-age-groups.sql';
import { CBC_AGE_18_19_SQL } from './cbc-age-18-19.sql';
import { CBC_ERYTHROCYTE_MCV_DESCRIPTION_SQL } from './cbc-erythrocyte-mcv-description.sql';
import { BILIRUBIN_DESCRIPTION_CORRECTION_SQL } from './bilirubin-description-correction.sql';
import { CBC_REFERENCE_AND_TEXT_CLEANUP_SQL } from './cbc-reference-and-text-cleanup.sql';
import { IRON_PREGNANCY_DESCRIPTION_SQL } from './iron-pregnancy-description.sql';
import { IRON_TIBC_DESCRIPTION_HTML_SQL } from './iron-tibc-description-html.sql';
import { TOTAL_PROTEIN_CORRECTION_SQL } from './total-protein-correction.sql';
import { PROTEIN_FRACTIONS_CORRECTION_SQL } from './protein-fractions-correction.sql';
import { PROTEIN_FRACTIONS_COMBINATIONS_SQL } from './protein-fractions-combinations.sql';
import { NITROGEN_METABOLISM_CORRECTION_SQL } from './nitrogen-metabolism-correction.sql';
import { LIVER_DESCRIPTION_CLEANUP_SQL } from './liver-description-cleanup.sql';
import { LIVER_AGE_CORRECTION_SQL } from './liver-age-correction.sql';
import { NEONATAL_BILIRUBIN_LDH_SQL } from './neonatal-bilirubin-ldh.sql';
import { GGTP_POINT_CONSOLIDATION_SQL } from './ggtp-point-consolidation.sql';
import { NEONATAL_BILIRUBIN_RUH_SQL } from './neonatal-bilirubin-ruh.sql';
import { LIVER_ENZYME_COMBINATIONS_SQL } from './liver-enzyme-combinations.sql';
import { DE_RITIS_REFERENCE_SQL } from './de-ritis-reference.sql';
import { SOURCE_DESCRIPTION_REVISION_SQL } from './source-description-revision.sql';
import { SOURCE_DESCRIPTION_TYPOS_SQL } from './source-description-typos.sql';
import { SOURCE_DESCRIPTION_CONCISION_SQL } from './source-description-concision.sql';
import { DE_RITIS_GRADATIONS_SQL } from './de-ritis-gradations.sql';
import { DESCRIPTION_WORDING_0024_SQL } from './description-wording-0024.sql';
import { DESCRIPTION_WORDING_REMAINING_SQL } from './description-wording-remaining.sql';
import { LIPID_GLUCOSE_TYPOS_SQL } from './lipid-glucose-typos.sql';
import { INSULIN_REFERENCE_UNIT_SQL } from './insulin-reference-unit.sql';
import { HOMA_AND_METABOLIC_COMBINATIONS_SQL } from './homa-and-metabolic-combinations.sql';
import { INSULIN_UNIT_DISPLAY_SQL } from './insulin-unit-display.sql';
import { LIPID_INSULIN_DESCRIPTION_CORRECTION_SQL } from './lipid-insulin-description-correction.sql';
import { THYROID_ELECTROLYTE_TYPOS_SQL } from './thyroid-electrolyte-typos.sql';
import { THYROID_ELECTROLYTE_CORRECTIONS_SQL } from './thyroid-electrolyte-corrections.sql';
import { IONIZED_CALCIUM_SQL } from './ionized-calcium.sql';
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
    await runRecordedMigration(
      this.sequelize,
      '0016-method45-reference-units',
      20016,
      METHOD45_UNIT_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0017-method45-reference-correction',
      20017,
      METHOD45_REFERENCE_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0018-cbc-missing-references',
      20018,
      CBC_MISSING_REFERENCE_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0019-cbc-reference-description-correction',
      20019,
      CBC_REFERENCE_DESCRIPTION_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0020-cbc-boundary-correction',
      20020,
      CBC_BOUNDARY_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0021-cbc-age-groups',
      20021,
      CBC_AGE_GROUPS_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0022-cbc-age-18-19',
      20022,
      CBC_AGE_18_19_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0023-cbc-erythrocyte-mcv-description',
      20023,
      CBC_ERYTHROCYTE_MCV_DESCRIPTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0024-bilirubin-description-correction',
      20024,
      BILIRUBIN_DESCRIPTION_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0025-cbc-reference-and-text-cleanup',
      20025,
      CBC_REFERENCE_AND_TEXT_CLEANUP_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0026-iron-pregnancy-description',
      20026,
      IRON_PREGNANCY_DESCRIPTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0027-iron-tibc-description-html',
      20027,
      IRON_TIBC_DESCRIPTION_HTML_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0028-total-protein-correction',
      20028,
      TOTAL_PROTEIN_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0029-protein-fractions-correction',
      20029,
      PROTEIN_FRACTIONS_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0030-protein-fractions-combinations',
      20030,
      PROTEIN_FRACTIONS_COMBINATIONS_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0031-nitrogen-metabolism-correction',
      20031,
      NITROGEN_METABOLISM_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0032-liver-description-cleanup',
      20032,
      LIVER_DESCRIPTION_CLEANUP_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0033-liver-age-correction',
      20033,
      LIVER_AGE_CORRECTION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0034-neonatal-bilirubin-ldh',
      20034,
      NEONATAL_BILIRUBIN_LDH_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0035-ggtp-point-consolidation',
      20035,
      GGTP_POINT_CONSOLIDATION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0036-neonatal-bilirubin-ruh',
      20036,
      NEONATAL_BILIRUBIN_RUH_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0037-liver-enzyme-combinations',
      20037,
      LIVER_ENZYME_COMBINATIONS_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0038-de-ritis-reference',
      20038,
      DE_RITIS_REFERENCE_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0039-source-description-revision',
      20039,
      SOURCE_DESCRIPTION_REVISION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0040-source-description-typos',
      20040,
      SOURCE_DESCRIPTION_TYPOS_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0041-source-description-concision',
      20041,
      SOURCE_DESCRIPTION_CONCISION_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0042-de-ritis-gradations',
      20042,
      DE_RITIS_GRADATIONS_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0043-description-wording',
      20043,
      DESCRIPTION_WORDING_0024_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0044-description-wording-remaining',
      20044,
      DESCRIPTION_WORDING_REMAINING_SQL,
    );
    await runRecordedMigration(
      this.sequelize,
      '0045-lipid-glucose-typos',
      20045,
      LIPID_GLUCOSE_TYPOS_SQL,
    );
    await runRecordedMigration(this.sequelize, '0046-insulin-reference-unit', 20046, INSULIN_REFERENCE_UNIT_SQL);
    await runRecordedMigration(this.sequelize, '0047-homa-metabolic-combinations', 20047, HOMA_AND_METABOLIC_COMBINATIONS_SQL);
    await runRecordedMigration(this.sequelize, '0048-insulin-unit-display', 20048, INSULIN_UNIT_DISPLAY_SQL);
    await runRecordedMigration(this.sequelize, '0049-lipid-insulin-description-correction', 20049, LIPID_INSULIN_DESCRIPTION_CORRECTION_SQL);
    await runRecordedMigration(this.sequelize, '0050-thyroid-electrolyte-typos', 20050, THYROID_ELECTROLYTE_TYPOS_SQL);
    await runRecordedMigration(this.sequelize, '0051-thyroid-electrolyte-corrections', 20051, THYROID_ELECTROLYTE_CORRECTIONS_SQL);
    await runRecordedMigration(this.sequelize, '0052-ionized-calcium', 20052, IONIZED_CALCIUM_SQL);
  }
}
