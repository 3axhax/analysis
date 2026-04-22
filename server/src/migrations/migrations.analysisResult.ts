import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MigrationsAnalysisResult {
  constructor(private readonly sequelize: Sequelize) {}
  async addAgeInDaysColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM "migrations" WHERE name = 'add_ageInDays_to_analysisResult'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE "analysisResult" 
          ADD COLUMN IF NOT EXISTS "ageInDays" integer DEFAULT 0 NOT NULL;
        `);
      await this.sequelize.query(
        `INSERT INTO "migrations" (name) VALUES ('add_ageInDays_to_analysisResult')`,
      );
      console.log('Migration add_ageInDays_to_analysisResult executed');
    }
  }
}
