/** Disposable DB verification only; no credentials or row values in output. */
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { MigrationsService } from '../src/migrations/migrations.service';
import { MigrationsAnalysisPoint } from '../src/migrations/migrations.analysisPoint';
import { MigrationsAnalysisPointUnits } from '../src/migrations/migrations.analysisPointUnits';
import { MigrationsAnalysisResult } from '../src/migrations/migrations.analysisResult';
import { MigrationsAges } from '../src/migrations/migrations.ages';
import { runRecordedMigration } from '../src/migrations/run-recorded-migration';

async function main() {
  const [database, mode] = process.argv.slice(2);
  if (
    !database ||
    !/^analysis_unitnorm_verify_[a-zA-Z0-9_]+$/.test(database) ||
    !['app', 'compiled', 'parallel'].includes(mode)
  )
    throw Error('Disposable verification database and mode required');
  process.env.POSTGRES_DB = database;
  let db: Sequelize;
  let close: () => Promise<void>;
  if (mode !== 'parallel') {
    // Import only after the disposable target is set. Do NOT override MigrationsService.
    /* eslint-disable @typescript-eslint/no-require-imports -- load only after disposable target is set */
    const { AppModule } = (
      mode === 'compiled'
        ? require('../dist/app.module')
        : require('../src/app.module')
    ) as typeof import('../src/app.module');
    /* eslint-enable @typescript-eslint/no-require-imports */
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = module.createNestApplication({ logger: false });
    db = module.get(Sequelize);
    close = () => app.close();
    try {
      await app.init();
    } catch {
      await close();
      throw Error('App startup failed');
    }
  } else {
    db = new Sequelize({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT || 5432),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database,
      logging: false,
    });
    close = () => db.close();
  }
  try {
    const [target] = await db.query<{ database: string }>(
      'SELECT current_database() AS database',
      { type: QueryTypes.SELECT },
    );
    assert.equal(target.database, database);
    const service = new MigrationsService(
      db,
      new MigrationsAnalysisPoint(db),
      new MigrationsAges(db),
      new MigrationsAnalysisResult(db),
      new MigrationsAnalysisPointUnits(db),
    );
    await Promise.all([service.onModuleInit(), service.onModuleInit()]);
    const signature = async () => {
      const [row] = await db.query<{ signature: string }>(
        `SELECT md5((SELECT json_agg(u ORDER BY id)::text FROM "analysisPointUnits" u)||(SELECT json_agg(l ORDER BY id)::text FROM analysis_point_units l)||(SELECT json_agg(r ORDER BY id)::text FROM "unitConversionRule" r)||(SELECT json_agg(m ORDER BY id)::text FROM migrations m)) AS signature`,
        { type: QueryTypes.SELECT },
      );
      return row.signature;
    };
    const before = await signature();
    await service.onModuleInit();
    assert.equal(await signature(), before);
    const [markers] = await db.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM migrations WHERE name IN ('0002-unit-normalization','0003-ferritin-source-unit','0006-source-measurements')`,
      { type: QueryTypes.SELECT },
    );
    assert.equal(markers.count, 3);
    const [link] = await db.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM analysis_point_units l JOIN "analysisPoint" p ON p.id=l."pointId" JOIN "analysisPointUnits" u ON u.id=l."unitsId" WHERE p.name='ferritin' AND u.name='ng/ml'`,
      { type: QueryTypes.SELECT },
    );
    assert.equal(link.count, 1);
    const [sourceCheck] = await db.query<{ valid: boolean }>(
      `SELECT convalidated AS valid FROM pg_constraint WHERE conrelid='"analysisResultPointData"'::regclass AND conname='normalized_source_fields'`,
      { type: QueryTypes.SELECT },
    );
    assert.equal(sourceCheck.valid, true);
    await assert.rejects(
      runRecordedMigration(
        db,
        'synthetic-startup-rollback',
        20999,
        'CREATE TABLE startup_failure_probe(id INTEGER); SELECT 1/0;',
      ),
      /database details omitted/,
    );
    const [rollback] = await db.query<{ clean: boolean }>(
      `SELECT to_regclass('public.startup_failure_probe') IS NULL AND NOT EXISTS(SELECT 1 FROM migrations WHERE name='synthetic-startup-rollback') AS clean`,
      { type: QueryTypes.SELECT },
    );
    assert.equal(rollback.clean, true);
    console.log(
      JSON.stringify({
        appBootstrap: mode !== 'parallel',
        compiledPayload: mode === 'compiled',
        parallelCalls: true,
        repeatedStartNoOp: true,
        compatibleMarkers: true,
        ferritinLinkUnique: true,
        sourceCheckValidated: true,
        ddlAndMarkerRollback: true,
      }),
    );
  } finally {
    await close();
  }
}
main().catch(() => {
  process.stderr.write(
    'Startup verification failed; database details suppressed\n',
  );
  process.exitCode = 1;
});
