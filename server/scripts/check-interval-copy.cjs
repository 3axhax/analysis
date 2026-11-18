/* Read aggregates only; run exclusively on the separately restored local copy. */
require('ts-node/register/transpile-only');
const { Sequelize, QueryTypes } = require('sequelize');
const { prepareIntervalTransition, finishIntervalTransition } = require('../src/migrations/interval-transition');
const { INTERVAL_SCHEMA_SQL } = require('../src/migrations/interval-schema.sql');
const { INTERVAL_REFERENCE_BACKFILL_SQL } = require('../src/migrations/interval-reference-backfill.sql');
const { INTERVAL_ONE_SIDED_VALUES_SQL, INTERVAL_ONE_SIDED_CONDITIONS_SQL } = require('../src/migrations/interval-one-sided-source.sql');
const { INTERVAL_CONDITION_BACKFILL_SQL } = require('../src/migrations/interval-condition-backfill.sql');
const { INTERVAL_DERITIS_BACKFILL_SQL } = require('../src/migrations/interval-deritis-backfill.sql');
const sql = [INTERVAL_SCHEMA_SQL, INTERVAL_REFERENCE_BACKFILL_SQL, INTERVAL_ONE_SIDED_VALUES_SQL, INTERVAL_CONDITION_BACKFILL_SQL, INTERVAL_ONE_SIDED_CONDITIONS_SQL, INTERVAL_DERITIS_BACKFILL_SQL].join('\n');

let phase = 'setup';
let failure = '';
async function main() {
  if (process.env.INTERVAL_COPY_CONFIRM !== 'true') throw Error('Copy confirmation required');
  const url = new URL(process.env.INTERVAL_COPY_DB_URL || '');
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname !== '/interval_copy_test') throw Error('Unexpected test database');
  const db = new Sequelize(url.toString(), { logging: false });
  const select = (query, transaction) => db.query(query, { type: QueryTypes.SELECT, transaction });
  const counts = async (transaction) => (await select(`SELECT
    (SELECT count(*)::int FROM "analysisResult") AS results,
    (SELECT count(*)::int FROM "analysisResultPointData") AS measurements,
    (SELECT count(*)::int FROM "analysisResultDescription") AS descriptions,
    (SELECT count(*)::int FROM "analysisResultDescriptionCondition") AS conditions,
    (SELECT count(*)::int FROM users) AS users,
    (SELECT count(*)::int FROM "users-sessions") AS sessions`, transaction))[0];
  const verify = async (transaction) => {
    const [summary] = await select(`SELECT
      (SELECT count(*)::int FROM "analysisPointIntervalValue") AS intervals,
      (SELECT count(*)::int FROM "analysisResultDescriptionCondition" c WHERE NOT EXISTS (SELECT 1 FROM "analysisResultIntervalDescriptionCondition" l WHERE l."conditionId"=c.id)) AS unlinked,
      (SELECT count(*)::int FROM "analysisResultIntervalDescriptionCondition" l JOIN "analysisResultDescriptionCondition" c ON c.id=l."conditionId" JOIN "analysisPointIntervalValue" i ON i.id=l."intervalId" WHERE c."pointId"<>i."pointId") AS wrong_point`, transaction);
    if (!summary.intervals || summary.unlinked || summary.wrong_point) throw Error('Interval coverage mismatch');
    const [check] = await select(`SELECT count(*)::int AS missing FROM "analysisPointMinValue" lo JOIN "analysisPointMaxValue" hi ON lo."sourceId" IS NOT DISTINCT FROM hi."sourceId" AND (lo."pointId",lo."ageId",lo."genderId",lo."unitId")=(hi."pointId",hi."ageId",hi."genderId",hi."unitId") WHERE NOT EXISTS (
      SELECT 1 FROM "analysisPointIntervalValue" i WHERE i."sourceId" IS NOT DISTINCT FROM lo."sourceId" AND (i."pointId",i."ageId",i."genderId",i."unitId")=(lo."pointId",lo."ageId",lo."genderId",lo."unitId") AND i.status='LOW' AND i."minValue" IS NULL AND i."maxValue"=lo.value::text::numeric AND i."maxValueEqual"=(lo."sourceId" IS NOT NULL AND lo."lowInclusive")
    ) OR NOT EXISTS (
      SELECT 1 FROM "analysisPointIntervalValue" i WHERE i."sourceId" IS NOT DISTINCT FROM lo."sourceId" AND (i."pointId",i."ageId",i."genderId",i."unitId")=(lo."pointId",lo."ageId",lo."genderId",lo."unitId") AND i.status='NORMAL' AND i."minValue"=lo.value::text::numeric AND i."maxValue"=hi.value::text::numeric AND i."minValueEqual"=(NOT (lo."sourceId" IS NOT NULL AND lo."lowInclusive")) AND i."maxValueEqual"
    ) OR NOT EXISTS (
      SELECT 1 FROM "analysisPointIntervalValue" i WHERE i."sourceId" IS NOT DISTINCT FROM lo."sourceId" AND (i."pointId",i."ageId",i."genderId",i."unitId")=(lo."pointId",lo."ageId",lo."genderId",lo."unitId") AND i.status='HIGH' AND i."maxValue" IS NULL AND i."minValue"=hi.value::text::numeric AND NOT i."minValueEqual"
    )`, transaction);
    if (check.missing) throw Error('Paired boundary mismatch');
    return summary;
  };
  try {
    const [initial] = await select("SELECT to_regclass('\"analysisPointIntervalValue\"') IS NULL AS absent, (SELECT count(*)::int FROM migrations WHERE name IN ('0055-interval-transition','0056-interval-cutover')) AS markers");
    if (!initial.absent || initial.markers) throw Error('Unexpected copy state');
    const before = await counts();
    phase = 'transactional dry run';
    let rolledBack = false;
    try { await db.transaction(async (transaction) => { await db.query(sql, { transaction }); await verify(transaction); throw Error('synthetic rollback'); }); } catch (error) { if (error.message !== 'synthetic rollback') throw error; rolledBack = true; }
    const [afterRollback] = await select("SELECT to_regclass('\"analysisPointIntervalValue\"') IS NULL AS absent");
    if (!rolledBack || !afterRollback.absent || JSON.stringify(await counts()) !== JSON.stringify(before)) throw Error('Rollback mismatch');
    phase = 'recorded migration';
    await prepareIntervalTransition(db);
    await prepareIntervalTransition(db);
    const summary = await verify();
    if (JSON.stringify(await counts()) !== JSON.stringify(before)) throw Error('Row counts changed');
    phase = 'cutover';
    await finishIntervalTransition(db);
    await finishIntervalTransition(db);
    const [finished] = await select("SELECT to_regclass('\"analysisPointMinValue\"') IS NULL AND to_regclass('\"analysisPointMaxValue\"') IS NULL AS removed, (SELECT count(*)::int FROM migrations WHERE name IN ('0055-interval-transition','0056-interval-cutover')) AS markers");
    if (!finished.removed || finished.markers !== 2 || JSON.stringify(await counts()) !== JSON.stringify(before)) throw Error('Cutover mismatch');
    phase = 'synthetic context';
    const [context] = await select(`SELECT p.id AS point_id, p.name AS point, u.name AS unit FROM "analysisPointIntervalValue" i JOIN "analysisPoint" p ON p.id=i."pointId" JOIN "analysisPointUnits" u ON u.id=i."unitId" JOIN ages a ON a.id=i."ageId" JOIN gender g ON g.id=i."genderId" WHERE i."sourceId" IS NULL AND i.status='NORMAL' AND g.name='m' AND a."intervalDayStart"<=10000 AND a."intervalDayEnd">=10000 ORDER BY p.id LIMIT 1`);
    if (!context) throw Error('Synthetic HTTP context unavailable');
    process.env.NODE_ENV = 'interval-test';
    process.env.POSTGRES_HOST = '127.0.0.1';
    process.env.POSTGRES_PORT = '5432';
    process.env.POSTGRES_USER = 'postgres';
    process.env.POSTGRES_PASSWORD = '';
    process.env.POSTGRES_DB = 'interval_copy_test';
    phase = 'application startup';
    const { NestFactory } = require('@nestjs/core');
    const { ValidationPipe } = require('@nestjs/common');
    const { AppModule } = require('../src/app.module');
    const app = await NestFactory.create(AppModule, { logger: false });
    try {
      app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }));
      await app.listen(0, '127.0.0.1');
      const address = app.getHttpServer().address();
      const base = `http://127.0.0.1:${address.port}`;
      const post = async (path, body) => {
        const response = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        if (!response.ok) { failure = `HTTP ${response.status}`; throw Error('Synthetic HTTP request failed'); }
        return response.json();
      };
      phase = 'synthetic save';
      const saved = await post('/result/save', { ageInDays: 10000, gender: 'm', pointData: [{ name: context.point, units: context.unit, value: '3.125' }] });
      if (!saved.resultId) throw Error('Synthetic HTTP save failed');
      phase = 'synthetic read';
      const read = await post('/result/get', { resultId: saved.resultId });
      const row = read.result?.analysisResultPointData?.find((item) => item.point?.name === context.point);
      if (!row) { failure = 'missing point'; throw Error('Synthetic HTTP read mismatch'); }
      if (row.displayValue !== '3.125') { failure = 'display mismatch'; throw Error('Synthetic HTTP read mismatch'); }
      if (!Array.isArray(row.matchingIntervals) || !row.matchingIntervals.length) { failure = 'no matching intervals'; throw Error('Synthetic HTTP read mismatch'); }
      phase = 'synthetic derived ratios';
      const enzymes = await select(`SELECT p.id,p.name,u.name AS unit FROM "analysisPoint" p JOIN analysis_point_units pu ON pu."pointId"=p.id JOIN "analysisPointUnits" u ON u.id=pu."unitsId" WHERE p.id IN (32,33) AND u.name='unit/l'`);
      if (new Set(enzymes.map((item) => item.id)).size !== 2) throw Error('Synthetic enzyme context unavailable');
      const ratioResult = await post('/result/save', { ageInDays: 10000, gender: 'm', pointData: enzymes.map((item) => ({ name: item.name, units: item.unit, value: item.id === 33 ? '1.7' : '1' })) });
      if (!ratioResult.resultId) throw Error('Synthetic ratio save failed');
      const ratioRead = await post('/result/get', { resultId: ratioResult.resultId });
      const ratio = ratioRead.result?.analysisResultPointData?.find((item) => item.point?.name === 'de_ritis_ratio');
      if (!ratio?.isCalculated || !ratio.matchingIntervals?.some((item) => item.status === null && item.minValue === '1.7' && item.maxValue === '1.7')) throw Error('Exact derived ratio mismatch');
      const metabolic = await select(`SELECT p.id,p.name,u.name AS unit FROM "analysisPoint" p JOIN analysis_point_units pu ON pu."pointId"=p.id JOIN "analysisPointUnits" u ON u.id=pu."unitsId" WHERE (p.id=44 AND u.name='mmole/l') OR (p.id=45 AND u.name='mUnit/l')`);
      if (new Set(metabolic.map((item) => item.id)).size !== 2) throw Error('Synthetic HOMA context unavailable');
      const homaResult = await post('/result/save', { ageInDays: 10000, gender: 'm', pointData: metabolic.map((item) => ({ name: item.name, units: item.unit, value: item.id === 44 ? '5' : '9' })) });
      if (!homaResult.resultId) throw Error('Synthetic HOMA save failed');
      const homaRead = await post('/result/get', { resultId: homaResult.resultId });
      const homa = homaRead.result?.analysisResultPointData?.find((item) => item.point?.name === 'homa_ir');
      if (!homa?.isCalculated || homa.displayValue !== '2') throw Error('Synthetic HOMA mismatch');
      phase = 'anonymous authorization';
      const anonymous = await fetch(base + '/admin/intervals/point/1');
      if (![401, 403].includes(anonymous.status)) throw Error('Anonymous administration was not rejected');
      phase = 'synthetic authorization';
      const { randomBytes } = require('crypto');
      const tokens = {};
      for (const role of ['USER', 'ADMIN']) {
        const random = randomBytes(16).toString('hex');
        const [user] = await db.query('INSERT INTO users (email,password,name,"createdAt","updatedAt") VALUES (:email,:password,:name,NOW(),NOW()) RETURNING id', { replacements: { email: `${random}@example.invalid`, password: 'synthetic', name: 'synthetic' }, type: QueryTypes.SELECT });
        await db.query('INSERT INTO "users-roles" ("userId","roleId") SELECT :userId,id FROM roles WHERE value::text=:role', { replacements: { userId: user.id, role } });
        const token = randomBytes(16).toString('hex');
        await db.query('INSERT INTO "users-sessions" ("userId",token,"createdAt") VALUES (:userId,:token,NOW())', { replacements: { userId: user.id, token } });
        tokens[role] = token;
      }
      const authorized = (token, path) => fetch(base + path, { headers: { authorization: `Bearer ${token}` } });
      const invalid = await authorized(randomBytes(16).toString('hex'), `/admin/intervals/point/${context.point_id}`);
      const standard = await authorized(tokens.USER, `/admin/intervals/point/${context.point_id}`);
      const admin = await authorized(tokens.ADMIN, `/admin/intervals/point/${context.point_id}`);
      const legacy = await authorized(tokens.ADMIN, '/analysisPoint/getFullList');
      if (![401, 403].includes(invalid.status) || standard.status !== 403 || admin.status !== 200 || legacy.status !== 404) throw Error('Synthetic role checks failed');
      await db.query('DELETE FROM "users-sessions" WHERE token=:token', { replacements: { token: tokens.ADMIN } });
      const revoked = await authorized(tokens.ADMIN, `/admin/intervals/point/${context.point_id}`);
      if (![401, 403].includes(revoked.status)) throw Error('Revoked synthetic session was accepted');
    } finally { await app.close(); }
    console.log('Isolated copy migration passed; intervals:', summary.intervals, 'unlinked conditions:', summary.unlinked);
  } finally { await db.close(); }
}
main().catch(() => { console.error('Isolated copy verification failed at:', phase, failure, '; database details omitted'); process.exitCode = 1; });
