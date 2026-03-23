import { Injectable, OnModuleInit } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { MigrationsAnalysisPoint } from './migrations.analysisPoint';

@Injectable()
export class MigrationsService implements OnModuleInit {
  constructor(
    private readonly sequelize: Sequelize,
    private migrationsAnalysisPoint: MigrationsAnalysisPoint,
  ) {}

  async onModuleInit() {
    await this.runMigrations();
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
      ['analysisPoint'].map(async (model) => {
        switch (model) {
          case 'analysisPoint':
            await this.migrationsAnalysisPoint.addTranslationRuENParsingColumn();
            break;
        }
      }),
    );
  }
}
