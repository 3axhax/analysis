import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MigrationsAnalysisPoint {
  constructor(private readonly sequelize: Sequelize) {}
  async addTranslationRuENParsingColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM "migrations" WHERE name = 'add_translationRuENParsing_to_analysisPoint'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE "analysisPoint" 
          ADD COLUMN IF NOT EXISTS "translationRu" varchar(255) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS "translationEn" varchar(255) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS "translationParsing" text DEFAULT NULL;
        `);
      await this.sequelize.query(
        `INSERT INTO "migrations" (name) VALUES ('add_translationRuENParsing_to_analysisPoint')`,
      );
      console.log(
        'Migration add_translationRuENParsing_to_analysisPoint executed',
      );
    }
  }

  async addPointHintRuENColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM "migrations" WHERE name = 'add_pointHintRuEN_to_analysisPoint'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE "analysisPoint" 
          ADD COLUMN IF NOT EXISTS "pointHintRu" text DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS "pointHintEn" text DEFAULT NULL
        `);
      await this.sequelize.query(
        `INSERT INTO "migrations" (name) VALUES ('add_pointHintRuEN_to_analysisPoint')`,
      );
      console.log('Migration add_pointHintRuEN_to_analysisPoint executed');
    }
  }
}
