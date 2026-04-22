import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class MigrationsAges {
  constructor(private readonly sequelize: Sequelize) {}
  async addIntervalsColumn() {
    const [results] = await this.sequelize.query(
      `SELECT * FROM "migrations" WHERE name = 'add_intervals_to_ages'`,
      { type: QueryTypes.SELECT },
    );

    if (!results) {
      await this.sequelize.query(`
          ALTER TABLE "ages" 
          ADD COLUMN IF NOT EXISTS "intervalDayStart" integer DEFAULT 0 NOT NULL,
          ADD COLUMN IF NOT EXISTS "intervalDayEnd" integer DEFAULT 0 NOT NULL;
        `);
      await this.sequelize.query(
        `INSERT INTO "migrations" (name) VALUES ('add_intervals_to_ages')`,
      );
      console.log('Migration add_intervals_to_ages executed');
    }
  }
}
