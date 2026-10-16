import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/** Same migration journal as the existing entity migrations, with atomic DDL+marker. */
export async function runRecordedMigration(
  sequelize: Sequelize,
  name: string,
  lockId: number,
  sql: string,
): Promise<void> {
  try {
    await sequelize.transaction(async (transaction) => {
      await sequelize.query('SELECT pg_advisory_xact_lock(:lockId)', {
        replacements: { lockId },
        transaction,
      });
      const applied = await sequelize.query<{ name: string }>(
        'SELECT name FROM migrations WHERE name=:name',
        { replacements: { name }, transaction, type: QueryTypes.SELECT },
      );
      if (applied.length) return;
      await sequelize.query(sql, { transaction });
      await sequelize.query('INSERT INTO migrations(name) VALUES(:name)', {
        replacements: { name },
        transaction,
      });
    });
  } catch {
    // Never include DB details, stored measurements or credentials in startup errors.
    throw new Error(`Migration ${name} failed; database details omitted`);
  }
}
