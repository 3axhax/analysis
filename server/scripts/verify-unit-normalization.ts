/** End-to-end synthetic checks. Never runs against a working database. */
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Op } from 'sequelize';
import request from 'supertest';
import type { Server } from 'node:http';
interface VerificationResult {
  result: {
    analysisResultPointData: {
      value: number;
      unitId: number;
      sourceUnitText: string;
      calculation: {
        value: string;
        coefficient: string;
        unitId: number;
        ruleId: number | null;
        ruleVersion: number | null;
        minValue: string;
        maxValue: string;
      };
      pointDataStatus: string | null;
      minValue: number;
      maxValue: number;
      interpretationWarning?: string | null;
    }[];
  };
  descriptions: { id: number }[];
}
import { MigrationsService } from '../src/migrations/migrations.service';
import { AnalysisResultPointDataService } from '../src/analysisResultPointData/analysisResultPointData.service';
import { AnalysisResult } from '../src/analysisResult/analysisResult.model';
import { AnalysisResultPointData } from '../src/analysisResultPointData/analysisResultPointData.model';

async function main() {
  const database = process.argv[2];
  if (!database || !/^analysis_unitnorm_verify_[a-zA-Z0-9_]+$/.test(database))
    throw Error('Disposable database required');
  process.env.POSTGRES_DB = database;
  // Delayed loading is essential: AppModule reads POSTGRES_DB during evaluation.
  /* eslint-disable @typescript-eslint/no-require-imports -- load only after setting disposable DB */
  const { AppModule } =
    require('../src/app.module') as typeof import('../src/app.module');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MigrationsService)
    .useValue({ onModuleInit: async () => {} })
    .compile();
  const app = module.createNestApplication({ logger: false });
  const cleanup: number[] = [];
  try {
    await app.init();
    const server = app.getHttpServer() as Server;
    const db = module.get(Sequelize);
    const [current] = await db.query<{ database: string }>(
      'SELECT current_database() AS database',
      { type: QueryTypes.SELECT },
    );
    assert.equal(current.database, database);
    const [context] = await db.query<{ days: number; gender: string }>(
      'SELECT a."intervalDayStart" AS days,g.name AS gender FROM "analysisPointMinValue" lo JOIN "analysisPoint" p ON p.id=lo."pointId" JOIN ages a ON a.id=lo."ageId" JOIN gender g ON g.id=lo."genderId" WHERE p.name=\'hemoglobin\' AND lo."unitId"=2 AND EXISTS(SELECT 1 FROM "analysisPointMinValue" m JOIN "analysisPoint" q ON q.id=m."pointId" WHERE q.name=\'mchc\' AND m."ageId"=lo."ageId" AND m."genderId"=lo."genderId" AND m."unitId"=2) ORDER BY a."intervalDayStart" LIMIT 1',
      { type: QueryTypes.SELECT },
    );
    assert.ok(context);
    const [unit] = await db.query<{ id: number }>(
      'SELECT id FROM "analysisPointUnits" WHERE name=\'g/dl\'',
      { type: QueryTypes.SELECT },
    );
    const counts = async () => {
      const [r] = await db.query<{ parents: string; children: string }>(
        'SELECT (SELECT count(*)::text FROM "analysisResult") AS parents,(SELECT count(*)::text FROM "analysisResultPointData") AS children',
        { type: QueryTypes.SELECT },
      );
      return r;
    };
    const save = async (
      value: number,
      units: string,
      sourceUnitText?: string,
    ) => {
      const response = await request(server)
        .post('/result/save')
        .send({
          ageInDays: context.days,
          gender: context.gender,
          pointData: [{ name: 'hemoglobin', value, units, sourceUnitText }],
        });
      assert.equal(response.status, 201);
      const body = response.body as { resultId: unknown };
      assert.ok(typeof body.resultId === 'string');
      const parent = await AnalysisResult.findOne({
        where: { resultId: body.resultId },
      });
      assert.ok(parent);
      cleanup.push(parent.id);
      const result = await request(server)
        .post('/result/get')
        .send({ resultId: body.resultId });
      assert.equal(result.status, 201);
      return result.body as VerificationResult;
    };
    const source = await save(12, 'g/dl', 'г/дл'),
      calculation = await save(120, 'g/l');
    const a = source.result.analysisResultPointData[0],
      b = calculation.result.analysisResultPointData[0];
    assert.equal(a.value, 12);
    assert.equal(a.unitId, unit.id);
    assert.equal(a.sourceUnitText, 'г/дл');
    assert.equal(a.calculation.value, '120');
    assert.equal(a.calculation.coefficient, '10');
    assert.equal(a.pointDataStatus, b.pointDataStatus);
    assert.deepEqual(
      source.descriptions.map((r) => r.id),
      calculation.descriptions.map((r) => r.id),
    );
    assert.ok(Math.abs(a.minValue * 10 - b.minValue) < 1e-10);
    assert.ok(Math.abs(a.maxValue * 10 - b.maxValue) < 1e-10);
    // Synthetic ferritin measurement: distinct units with a unit coefficient.
    const [ferritinContext] = await db.query<{
      days: number;
      gender: string;
      sourceId: number;
      targetId: number;
    }>(
      `SELECT a."intervalDayStart" AS days,g.name AS gender,
        src.id AS "sourceId",dst.id AS "targetId"
       FROM "analysisPointMinValue" lo
       JOIN "analysisPoint" p ON p.id=lo."pointId"
       JOIN ages a ON a.id=lo."ageId"
       JOIN gender g ON g.id=lo."genderId"
       JOIN "analysisPointUnits" src ON src.name='ng/ml'
       JOIN "analysisPointUnits" dst ON dst.name='mkg/l' AND dst.id=lo."unitId"
       WHERE p.name='ferritin' ORDER BY a."intervalDayStart" LIMIT 1`,
      { type: QueryTypes.SELECT },
    );
    assert.ok(ferritinContext);
    const ferritinResults: VerificationResult[] = [];
    for (const units of ['ng/ml', 'mkg/l']) {
      const response = await request(server)
        .post('/result/save')
        .send({
          ageInDays: ferritinContext.days,
          gender: ferritinContext.gender,
          pointData: [
            { name: 'ferritin', value: 42, units, sourceUnitText: units },
          ],
        });
      assert.equal(response.status, 201);
      const body = response.body as { resultId: string };
      const parent = await AnalysisResult.findOne({
        where: { resultId: body.resultId },
      });
      assert.ok(parent);
      cleanup.push(parent.id);
      const read = await request(server)
        .post('/result/get')
        .send({ resultId: body.resultId });
      assert.equal(read.status, 201);
      ferritinResults.push(read.body as VerificationResult);
    }
    const ferritinSource = ferritinResults[0].result.analysisResultPointData[0];
    const ferritinTarget = ferritinResults[1].result.analysisResultPointData[0];
    assert.equal(ferritinSource.value, 42);
    assert.equal(ferritinSource.unitId, ferritinContext.sourceId);
    assert.equal(ferritinSource.sourceUnitText, 'ng/ml');
    assert.equal(ferritinSource.calculation.value, '42');
    assert.equal(ferritinSource.calculation.unitId, ferritinContext.targetId);
    assert.equal(ferritinSource.calculation.coefficient, '1');
    assert.equal(
      ferritinSource.pointDataStatus,
      ferritinTarget.pointDataStatus,
    );
    assert.notEqual(ferritinSource.pointDataStatus, null);
    assert.equal(ferritinSource.minValue, ferritinTarget.minValue);
    assert.equal(ferritinSource.maxValue, ferritinTarget.maxValue);
    assert.deepEqual(
      ferritinResults[0].descriptions,
      ferritinResults[1].descriptions,
    );
    const [sourceOnlyStored] = await db.query<{ rows: number }>(
      'SELECT count(*)::int AS rows FROM "analysisResultPointData" WHERE "resultId"=:id AND "sourceValue" IS NOT NULL AND "calculationValue" IS NULL AND "referenceMin" IS NULL AND "referenceMax" IS NULL',
      { type: QueryTypes.SELECT, replacements: { id: cleanup[0] } },
    );
    assert.equal(sourceOnlyStored.rows, 1);
    // Explicit old-format snapshot fixture on the disposable DB only.
    await db.query(
      `UPDATE "analysisResultPointData" SET value=:value,"unitId"=:unit,
        "calculationValue"=:value,"conversionRuleId"=:rule,
        "conversionRuleVersion"=:version,"appliedCoefficient"=:coefficient,
        "referenceMin"=:minimum,"referenceMax"=:maximum WHERE "resultId"=:id`,
      {
        replacements: {
          id: cleanup[0],
          value: a.calculation.value,
          unit: a.calculation.unitId,
          rule: a.calculation.ruleId,
          version: a.calculation.ruleVersion,
          coefficient: a.calculation.coefficient,
          minimum: a.calculation.minValue,
          maximum: a.calculation.maxValue,
        },
      },
    );
    const [snapshot] = await db.query<{ ruleId: number; resultId: string }>(
      'SELECT d."conversionRuleId" AS "ruleId",r."resultId" FROM "analysisResultPointData" d JOIN "analysisResult" r ON r.id=d."resultId" WHERE r.id=:id',
      { type: QueryTypes.SELECT, replacements: { id: cleanup[0] } },
    );
    await db.query(
      'UPDATE "unitConversionRule" SET active=false WHERE id=:id',
      { replacements: { id: snapshot.ruleId } },
    );
    try {
      const history = await request(server)
        .post('/result/get')
        .send({ resultId: snapshot.resultId });
      assert.equal(history.status, 201);
      assert.equal(
        (history.body as VerificationResult).result.analysisResultPointData[0]
          .calculation.value,
        '120',
      );
    } finally {
      await db.query(
        'UPDATE "unitConversionRule" SET active=true WHERE id=:id',
        { replacements: { id: snapshot.ruleId } },
      );
    }
    const zero = await save(0, 'g/dl');
    assert.equal(zero.result.analysisResultPointData[0].value, 0);
    const [missingContext] = await db.query<{ days: number; gender: string }>(
      `SELECT a."intervalDayStart" AS days,g.name AS gender FROM ages a CROSS JOIN gender g
       WHERE NOT EXISTS(SELECT 1 FROM "analysisPointMinValue" n JOIN "analysisPoint" p ON p.id=n."pointId" WHERE p.name='monocyte-count' AND n."ageId"=a.id AND n."genderId"=g.id)
       AND NOT EXISTS(SELECT 1 FROM "analysisPointMaxValue" n JOIN "analysisPoint" p ON p.id=n."pointId" WHERE p.name='monocyte-count' AND n."ageId"=a.id AND n."genderId"=g.id)
       AND EXISTS(SELECT 1 FROM "analysisPointMinValue" n JOIN "analysisPoint" p ON p.id=n."pointId" JOIN "analysisPointUnits" u ON u.id=n."unitId" WHERE p.name='hemoglobin' AND u.name='g/l' AND n."ageId"=a.id AND n."genderId"=g.id)
       ORDER BY a.id,g.id LIMIT 1`,
      { type: QueryTypes.SELECT },
    );
    assert.ok(missingContext);
    const mixed = await request(server)
      .post('/result/save')
      .send({
        ageInDays: missingContext.days,
        gender: missingContext.gender,
        pointData: [
          { name: 'hemoglobin', value: 120, units: 'g/l' },
          {
            name: 'monocyte-count',
            value: '0.123456789123456789',
            units: '10^9/l',
          },
        ],
      });
    assert.equal(mixed.status, 201);
    const mixedBody = mixed.body as { resultId: string };
    const mixedParent = await AnalysisResult.findOne({
      where: { resultId: mixedBody.resultId },
    });
    assert.ok(mixedParent);
    cleanup.push(mixedParent.id);
    const mixedRead = await request(server)
      .post('/result/get')
      .send({ resultId: mixedBody.resultId });
    assert.equal(mixedRead.status, 201);
    const mixedRows = (mixedRead.body as VerificationResult).result
      .analysisResultPointData;
    assert.equal(mixedRows.length, 2);
    assert.equal(mixedRows.filter((p) => p.pointDataStatus !== null).length, 1);
    const noNorm = mixedRows.find(
      (p) => p.interpretationWarning === 'no_convertible_reference_range',
    );
    assert.ok(noNorm);
    assert.equal(noNorm.minValue, null);
    assert.equal(noNorm.maxValue, null);
    assert.equal(noNorm.pointDataStatus, null);
    assert.equal(noNorm.value, Number('0.123456789123456789'));
    const [exactSource] = await db.query<{ exact: boolean; rows: number }>(
      `SELECT count(*)::int AS rows,bool_and("sourceValue" IS NOT NULL AND "calculationValue" IS NULL) AS exact FROM "analysisResultPointData" WHERE "resultId"=:id`,
      { type: QueryTypes.SELECT, replacements: { id: mixedParent.id } },
    );
    assert.equal(exactSource.rows, 2);
    assert.equal(exactSource.exact, true);
    const [precise] = await db.query<{ exact: boolean }>(
      `SELECT "sourceValue"=0.123456789123456789::numeric AS exact FROM "analysisResultPointData" d JOIN "analysisPoint" p ON p.id=d."pointId" WHERE d."resultId"=:id AND p.name='monocyte-count'`,
      { type: QueryTypes.SELECT, replacements: { id: mixedParent.id } },
    );
    assert.equal(precise.exact, true);
    const before = await counts();
    const invalid = await request(server)
      .post('/result/save')
      .send({
        ageInDays: context.days,
        gender: context.gender,
        pointData: [
          { name: 'hemoglobin', value: 12, units: 'g/dl' },
          { name: 'hemoglobin', value: 12, units: 'g/l' },
        ],
      });
    assert.equal(invalid.status, 422);
    assert.deepEqual(await counts(), before);
    const service = module.get(AnalysisResultPointDataService),
      original = service.savePointData;
    let writes = 0;
    service.savePointData = async (...args) => {
      if (++writes === 2) throw Error('synthetic storage failure');
      return original(...args);
    };
    try {
      const failed = await request(server)
        .post('/result/save')
        .send({
          ageInDays: context.days,
          gender: context.gender,
          pointData: [
            { name: 'hemoglobin', value: 12, units: 'g/dl' },
            { name: 'mchc', value: 12, units: 'g/dl' },
          ],
        });
      assert.equal(failed.status, 503);
      assert.deepEqual(await counts(), before);
    } finally {
      service.savePointData = original;
    }
    const denied = await request(server)
      .post('/units/edit')
      .send({ id: unit.id, name: 'g/dl', translationParsing: 'bad' });
    assert.equal(denied.status, 403);
    const [ctx] = await db.query<{
      ageId: number;
      genderId: number;
      pointId: number;
    }>(
      'SELECT r."ageId",r."genderId",p.id AS "pointId" FROM "analysisResult" r CROSS JOIN "analysisPoint" p WHERE r.id=:id AND p.name=\'hemoglobin\'',
      { type: QueryTypes.SELECT, replacements: { id: cleanup[0] } },
    );
    const legacy = await AnalysisResult.create({
      resultId: 'unit-normalization-legacy-copy-only',
      ageId: ctx.ageId,
      genderId: ctx.genderId,
      ageInDays: context.days,
    });
    cleanup.push(legacy.id);
    await AnalysisResultPointData.create({
      resultId: legacy.id,
      pointId: ctx.pointId,
      value: 12,
      unitId: unit.id,
    });
    const old = await request(server)
      .post('/result/get')
      .send({ resultId: legacy.resultId });
    assert.equal(old.status, 201);
    const oldBody = old.body as VerificationResult;
    const oldPoint = oldBody.result.analysisResultPointData[0];
    assert.equal(oldPoint.value, 12);
    assert.equal(oldPoint.unitId, unit.id);
    assert.equal(oldPoint.calculation.value, '120');
    assert.equal(oldPoint.calculation.unitId, 2);
    assert.equal(oldPoint.calculation.coefficient, '10');
    assert.equal(oldPoint.minValue, a.minValue);
    assert.equal(oldPoint.maxValue, a.maxValue);
    assert.equal(
      oldBody.result.analysisResultPointData[0].pointDataStatus,
      b.pointDataStatus,
    );
    await AnalysisResultPointData.update(
      { unitId: 1 },
      { where: { resultId: legacy.id } },
    );
    const unsupported = await request(server)
      .post('/result/get')
      .send({ resultId: legacy.resultId });
    assert.equal(unsupported.status, 201);
    assert.equal(
      (unsupported.body as VerificationResult).result.analysisResultPointData[0]
        .pointDataStatus,
      null,
    );
    assert.deepEqual((unsupported.body as VerificationResult).descriptions, []);
    console.log(
      JSON.stringify({
        sourceDisplay: true,
        ferritinCoefficientOne: true,
        equivalentStatus: true,
        inverseBounds: true,
        zero: true,
        validationAtomic: true,
        storageRollback: true,
        anonymousAdminDenied: true,
        legacyCompatible: true,
        legacyConvertedUnit: true,
        historicalRuleStable: true,
        missingNormNotNormal: true,
        missingNormDoesNotBlockSave: true,
        allSourceRowsPreserved: true,
        sourceDecimalPreserved: true,
      }),
    );
  } finally {
    if (cleanup.length) {
      await AnalysisResultPointData.destroy({
        where: { resultId: { [Op.in]: cleanup } },
      });
      await AnalysisResult.destroy({ where: { id: { [Op.in]: cleanup } } });
    }
    await app.close();
  }
}
main().catch(() => {
  process.stderr.write(
    'Synthetic normalization verification failed; sensitive details suppressed\n',
  );
  process.exitCode = 1;
});
