import { runRecordedMigration } from './run-recorded-migration';
import type { Sequelize } from 'sequelize-typescript';

describe('recorded startup migration', () => {
  const setup = (applied = false) => {
    const transaction = { id: 'synthetic' };
    const query = jest.fn((sql: string) =>
      Promise.resolve(
        sql.startsWith('SELECT name') && applied ? [{ name: 'reviewed' }] : [],
      ),
    );
    const db = {
      query,
      transaction: jest.fn(
        async (callback: (t: typeof transaction) => Promise<void>) =>
          callback(transaction),
      ),
    };
    return { db: db as unknown as Sequelize, query, transaction };
  };

  it('skips DDL and marker insert when the old manual marker exists', async () => {
    const s = setup(true);
    await runRecordedMigration(s.db, 'reviewed', 1, 'DDL');
    expect(s.query.mock.calls.map((c) => c[0])).toEqual([
      'SELECT pg_advisory_xact_lock(:lockId)',
      'SELECT name FROM migrations WHERE name=:name',
    ]);
  });

  it('locks, checks, applies and records in the same transaction', async () => {
    const s = setup();
    await runRecordedMigration(s.db, 'reviewed', 1, 'DDL');
    expect(s.query.mock.calls.map((c) => c[0])).toEqual([
      'SELECT pg_advisory_xact_lock(:lockId)',
      'SELECT name FROM migrations WHERE name=:name',
      'DDL',
      'INSERT INTO migrations(name) VALUES(:name)',
    ]);
    for (const [, options] of s.query.mock.calls as unknown as [
      string,
      { transaction: unknown },
    ][])
      expect(options.transaction).toBe(s.transaction);
  });

  it('does not record failed DDL and sanitizes database errors', async () => {
    const s = setup();
    s.query.mockImplementation((sql) => {
      if (sql === 'DDL') return Promise.reject(Error('PRIVATE_DB_DETAILS'));
      return Promise.resolve([]);
    });
    await expect(
      runRecordedMigration(s.db, 'reviewed', 1, 'DDL'),
    ).rejects.toThrow('Migration reviewed failed; database details omitted');
    expect(s.query.mock.calls.some((c) => c[0].startsWith('INSERT INTO'))).toBe(
      false,
    );
  });
});
