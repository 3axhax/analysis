import { Sequelize, QueryTypes, Transaction } from 'sequelize';
import type { CorpusCatalogPoint } from '../src/analysisResult/pdf-corpus-expected';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

interface CatalogRow {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  parsingWords: string;
  parsingOrder: number;
  units: { id: number; name: string }[];
}

/** Direct read-only query; never boot Nest or execute startup migrations. */
export async function loadCurrentCorpusCatalog(
  directOnly = false,
): Promise<CorpusCatalogPoint[]> {
  if (
    !process.env.POSTGRES_HOST ||
    !process.env.POSTGRES_USER ||
    !process.env.POSTGRES_DB
  ) {
    if (directOnly) throw new Error('Database configuration unavailable');
    // Reuse an existing server's DB configuration without copying any files,
    // bootstrapping the Nest application or persisting the catalog.
    const code =
      "require('./scripts/nest-corpus-catalog').loadCurrentCorpusCatalog(true).then(c => process.stdout.write(JSON.stringify(c))).catch(() => process.exit(1))";
    const { stdout } = await promisify(execFile)(
      'docker',
      [
        'exec',
        '-w',
        '/app/server',
        process.env.NEST_CORPUS_DB_CONTAINER ?? 'serverAnalysis',
        'node',
        '-r',
        'ts-node/register/transpile-only',
        '-e',
        code,
      ],
      { maxBuffer: 1024 * 1024, timeout: 30000 },
    );
    return JSON.parse(stdout) as CorpusCatalogPoint[];
  }
  const db = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    logging: false,
  });
  try {
    return await db.transaction(
      {
        readOnly: true,
        isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
      },
      async (transaction) => {
        await db.query('SET TRANSACTION READ ONLY', { transaction });
        const rows = await db.query<CatalogRow>(
          `
        SELECT p.id, p.name,
          COALESCE((SELECT t.value FROM translation t WHERE t.namespace='entities' AND t.module='analysisPoint' AND t.submodule=p.name AND t.lang='ru' ORDER BY t.id LIMIT 1), '') AS "translationRu",
          COALESCE((SELECT t.value FROM translation t WHERE t.namespace='entities' AND t.module='analysisPoint' AND t.submodule=p.name AND t.lang='en' ORDER BY t.id LIMIT 1), '') AS "translationEn",
          COALESCE(p."translationParsing", '') AS "parsingWords",
          COALESCE(p."parsingOrder", 0) AS "parsingOrder",
          COALESCE((SELECT json_agg(json_build_object('id', u.id, 'name', u.name) ORDER BY u.id) FROM analysis_point_units l JOIN "analysisPointUnits" u ON u.id=l."unitsId" WHERE l."pointId"=p.id), '[]'::json) AS units
        FROM "analysisPoint" p ORDER BY p.id
      `,
          { transaction, type: QueryTypes.SELECT },
        );
        return rows;
      },
    );
  } finally {
    await db.close();
  }
}
