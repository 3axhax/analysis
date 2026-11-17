/* Synthetic-only migration verification. Never point this script at application data. */
require('ts-node/register/transpile-only');
const { Sequelize, QueryTypes } = require('sequelize');
const { prepareIntervalTransition, finishIntervalTransition } = require('../src/migrations/interval-transition');
const { INTERVAL_CUTOVER_SQL } = require('../src/migrations/interval-cutover.sql');
const { IntervalAdminService } = require('../src/interval/interval-admin.service');
const { IntervalReaderService } = require('../src/interval/interval-reader.service');

async function main() {
  const connection = process.env.INTERVAL_SYNTHETIC_DB_URL;
  if (!connection || process.env.INTERVAL_SYNTHETIC_CONFIRM !== 'true') throw Error('Synthetic database confirmation required');
  const url = new URL(connection);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname !== '/interval_synthetic_test') throw Error('Unexpected test database');
  const db = new Sequelize(connection, { logging: false });
  try {
    const existing = await db.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'", { type: QueryTypes.SELECT });
    if (existing[0].n !== 0) throw Error('Test database must be empty');
    await db.query(`
      CREATE TABLE migrations (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE "medicalSource" (id INTEGER PRIMARY KEY,parent_id INTEGER,metadata JSONB NOT NULL DEFAULT '{}');
      CREATE TABLE "analysisPoint" (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
      CREATE TABLE ages (id INTEGER PRIMARY KEY);
      CREATE TABLE gender (id INTEGER PRIMARY KEY);
      CREATE TABLE "analysisPointUnits" (id INTEGER PRIMARY KEY);
      CREATE TABLE analysis_point_units (id SERIAL PRIMARY KEY,"pointId" INTEGER,"unitsId" INTEGER);
      CREATE TABLE "unitConversionRule" (id INTEGER PRIMARY KEY,"pointId" INTEGER,"fromUnitId" INTEGER,"toUnitId" INTEGER,coefficient NUMERIC,version INTEGER,active BOOLEAN);
      CREATE TABLE "analysisPointMinValue" (id SERIAL PRIMARY KEY,"sourceId" INTEGER,"pointId" INTEGER,"ageId" INTEGER,"genderId" INTEGER,"unitId" INTEGER,value DOUBLE PRECISION,"lowInclusive" BOOLEAN NOT NULL DEFAULT false);
      CREATE TABLE "analysisPointMaxValue" (id SERIAL PRIMARY KEY,"sourceId" INTEGER,"pointId" INTEGER,"ageId" INTEGER,"genderId" INTEGER,"unitId" INTEGER,value DOUBLE PRECISION);
      CREATE TABLE "analysisResultDescription" (id SERIAL PRIMARY KEY,"sourceId" INTEGER,"deRitisRule" TEXT,description_ru TEXT NOT NULL DEFAULT '',"createdAt" TIMESTAMP DEFAULT now(),"updatedAt" TIMESTAMP DEFAULT now());
      CREATE TABLE "analysisResultDescriptionCondition" (id SERIAL PRIMARY KEY,"descriptionId" INTEGER,"pointId" INTEGER,status TEXT NOT NULL);
      CREATE TABLE "sourceReferenceInheritance" ("sourceId" INTEGER,"pointId" INTEGER);
      INSERT INTO "medicalSource" (id,parent_id,metadata) VALUES (9,NULL,'{}'),(10,9,'{"doi":"10.1002/ccr3.1529"}'),(11,9,'{"sourceKey":"nutritional-assessment-iron-2024"}');
      INSERT INTO "analysisPoint" VALUES (1,'ferritin'),(2,'de_ritis_ratio'),(3,'hemoglobin');
      INSERT INTO ages SELECT generate_series(1,4); INSERT INTO gender VALUES (1); INSERT INTO "analysisPointUnits" VALUES (1);
      INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (1,1),(2,1),(3,1);
      INSERT INTO "analysisPointMinValue" ("sourceId","pointId","ageId","genderId","unitId",value) VALUES (NULL,1,1,1,1,1),(NULL,2,1,1,1,0.5);
      INSERT INTO "analysisPointMinValue" ("sourceId","pointId","ageId","genderId","unitId",value,"lowInclusive") SELECT s,p,a,1,1,3,(s=10 AND p=3) FROM (VALUES (10),(11)) sources(s) CROSS JOIN (VALUES (1),(3)) points(p) CROSS JOIN generate_series(1,4) ages(a);
      INSERT INTO "analysisPointMaxValue" ("sourceId","pointId","ageId","genderId","unitId",value) VALUES (NULL,1,1,1,1,2),(NULL,2,1,1,1,2);
      INSERT INTO "analysisResultDescription" (id,"sourceId","deRitisRule") VALUES (1,NULL,NULL),(2,10,NULL),(3,NULL,'eq_1_5'),(4,10,NULL),(5,11,NULL),(6,11,NULL);
      INSERT INTO "analysisResultDescriptionCondition" VALUES (1,1,1,'-1'),(2,2,1,'0'),(3,3,2,'-1'),(4,4,3,'-1'),(5,5,1,'0'),(6,6,3,'0');
      SELECT setval(pg_get_serial_sequence('"analysisResultDescription"','id'),6);
      SELECT setval(pg_get_serial_sequence('"analysisResultDescriptionCondition"','id'),6);
    `);
    await db.query('INSERT INTO "analysisPointMinValue" ("sourceId","pointId","ageId","genderId","unitId",value) VALUES (NULL,1,1,1,1,1)');
    let duplicateRejected = false;
    try { await prepareIntervalTransition(db); } catch { duplicateRejected = true; }
    const afterDuplicate = await db.query("SELECT to_regclass('\"analysisPointIntervalValue\"') IS NULL AS absent, (SELECT count(*)::int FROM migrations WHERE name='0055-interval-transition') AS markers", { type: QueryTypes.SELECT });
    if (!duplicateRejected || !afterDuplicate[0].absent || afterDuplicate[0].markers !== 0) throw Error('Duplicate did not roll back transition');
    await db.query('DELETE FROM "analysisPointMinValue" WHERE id=(SELECT max(id) FROM "analysisPointMinValue")');
    await prepareIntervalTransition(db);
    await prepareIntervalTransition(db);
    const counts = await db.query('SELECT (SELECT count(*)::int FROM "analysisPointIntervalValue") AS intervals, (SELECT count(*)::int FROM "analysisResultIntervalDescriptionCondition") AS links, (SELECT count(*)::int FROM migrations WHERE name=\'0055-interval-transition\') AS markers', { type: QueryTypes.SELECT });
    if (counts[0].intervals !== 32 || counts[0].links !== 18 || counts[0].markers !== 1) throw Error('Unexpected transition counts');
    const limits = await db.query('SELECT status,"minValue"::text AS lo,"maxValue"::text AS hi,"minValueEqual" AS lo_equal,"maxValueEqual" AS hi_equal FROM "analysisPointIntervalValue" WHERE "pointId"=1 AND "sourceId" IS NULL ORDER BY status', { type: QueryTypes.SELECT });
    const expected = [
      { status: 'HIGH', lo: '2', hi: null, lo_equal: false, hi_equal: null },
      { status: 'LOW', lo: null, hi: '1', lo_equal: null, hi_equal: false },
      { status: 'NORMAL', lo: '1', hi: '2', lo_equal: true, hi_equal: true },
    ];
    if (JSON.stringify(limits) !== JSON.stringify(expected)) throw Error('Boundary semantics changed');
    const reader = new IntervalReaderService(db);
    const sources = [{ id: 9, parentId: null, name: 'root', metadata: {} }, { id: 10, parentId: 9, name: 'source', metadata: {} }, { id: 11, parentId: 9, name: 'source', metadata: {} }];
    const checkValue = async (value) => reader.evaluate([{ pointId: 3, ageId: 1, genderId: 1, unitId: 1, value }], sources);
    const below = await checkValue('2.999999999999999999');
    const exact = await checkValue('3');
    const above = await checkValue('3.000000000000000001');
    if (!below.intervals.some((i) => i.sourceId === 10 && i.status === 'LOW') || !below.intervals.some((i) => i.sourceId === 11 && i.status === 'LOW')) throw Error('Lower boundary mismatch');
    if (!exact.intervals.some((i) => i.sourceId === 10 && i.status === 'LOW') || exact.intervals.some((i) => i.sourceId === 11 && i.status === 'LOW') || exact.descriptions.some((d) => d.id === 4)) throw Error('Boundary inclusion mismatch');
    if (!above.descriptions.some((d) => d.id === 4) || !above.intervals.some((i) => i.sourceId === 10 && i.status === null) || above.intervals.some((i) => i.sourceId === 10 && i.status === 'NORMAL')) throw Error('Above-threshold condition mismatch');
    const expectConstraint = async (sql) => {
      let rejected = false;
      try { await db.transaction(async (transaction) => { await db.query(sql, { transaction }); }); } catch { rejected = true; }
      if (!rejected) throw Error('Expected constraint rejection');
    };
    await expectConstraint('INSERT INTO "analysisPointIntervalValue" ("pointId","ageId","genderId","unitId","minValue","maxValue","minValueEqual","maxValueEqual") VALUES (1,1,1,1,1,1,true,false)');
    await expectConstraint('INSERT INTO "analysisPointIntervalValue" ("pointId","ageId","genderId","unitId","minValue","minValueEqual") VALUES (1,1,1,1,0.0000000000000000001,true)');
    await expectConstraint('INSERT INTO "analysisResultIntervalDescriptionCondition" SELECT "conditionId","intervalId","pointId" FROM "analysisResultIntervalDescriptionCondition" LIMIT 1');
    await expectConstraint('INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId") SELECT 3,id,2 FROM "analysisPointIntervalValue" WHERE "pointId"=1 LIMIT 1');
    const admin = new IntervalAdminService(db);
    const created = await admin.save({ pointId: 1, ageId: 1, genderId: 1, unitId: 1, sourceId: 10, minValue: '1,25', maxValue: null, minValueEqual: true, maxValueEqual: null, status: null }, true);
    const saved = await db.query('SELECT "minValue"::text AS value FROM "analysisPointIntervalValue" WHERE id=:id', { replacements: { id: created.id }, type: QueryTypes.SELECT });
    if (saved[0].value !== '1.25') throw Error('Decimal comma was not preserved');
    const description = await admin.saveDescription({ sourceId: 10, description_ru: 'synthetic', conditions: [{ pointId: 1, intervalIds: [created.id] }] });
    const loaded = await admin.getDescription(description.id);
    if (loaded.conditions.length !== 1 || loaded.conditions[0].intervalIds[0] !== created.id) throw Error('Description condition mismatch');
    let deleteRejected = false;
    try { await admin.remove(created.id); } catch { deleteRejected = true; }
    if (!deleteRejected) throw Error('Used interval was deleted');
    await admin.deleteDescription(description.id);
    await admin.remove(created.id);
    await db.query("INSERT INTO \"analysisResultDescription\" (id,\"sourceId\") VALUES (90,11); INSERT INTO \"analysisResultDescriptionCondition\" (id,\"descriptionId\",\"pointId\",status) VALUES (90,90,3,'1')");
    let rejected = false;
    try { await finishIntervalTransition(db); } catch { rejected = true; }
    if (!rejected) throw Error('Cutover did not reject unmatched synthetic data');
    const pending = await db.query("SELECT count(*)::int AS n FROM migrations WHERE name='0056-interval-cutover'", { type: QueryTypes.SELECT });
    if (pending[0].n !== 0) throw Error('Failed cutover recorded a marker');
    await db.query('DELETE FROM "analysisResultDescriptionCondition" WHERE id=90; DELETE FROM "analysisResultDescription" WHERE id=90');
    let rolledBack = false;
    try {
      await db.transaction(async (transaction) => { await db.query(INTERVAL_CUTOVER_SQL, { transaction }); throw Error('synthetic rollback'); });
    } catch { rolledBack = true; }
    const beforeCutover = await db.query("SELECT to_regclass('\"analysisPointMinValue\"') IS NOT NULL AS present", { type: QueryTypes.SELECT });
    if (!rolledBack || !beforeCutover[0].present) throw Error('Cutover transaction rollback failed');
    await finishIntervalTransition(db);
    await finishIntervalTransition(db);
    const complete = await db.query("SELECT to_regclass('\"analysisPointMinValue\"') IS NULL AS removed, (SELECT count(*)::int FROM migrations WHERE name='0056-interval-cutover') AS markers", { type: QueryTypes.SELECT });
    if (!complete[0].removed || complete[0].markers !== 1) throw Error('Cutover verification failed');
    console.log('Synthetic migration, rejection, rollback and idempotence: passed');
  } finally { await db.close(); }
}
main().catch(() => { console.error('Synthetic migration check failed'); process.exitCode = 1; });
