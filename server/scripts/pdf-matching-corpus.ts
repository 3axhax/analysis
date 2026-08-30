import axios from 'axios';
import FormData from 'form-data';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { AnalysisPointWithTranslation } from '../src/analysisPoint/analysisPoint.service';
import {
  HybridPdfFindingMatcher,
  LegacyPdfFindingMatcher,
  StructuredPdfFindingMatcher,
} from '../src/analysisResult/pdf-finding-matcher';
import { PdfMatcherResult } from '../src/analysisResult/pdf-matching.types';
import { ExtractTablesResponse } from '../src/pdf-parser/pdf-parser.types';

interface PointRow {
  id: number;
  name: string;
  translation_ru: string;
  translation_en: string;
  parsing_words: string;
  parsing_order: number;
  units: Array<{ id: number; name: string }> | null;
}

interface SafeRunResult {
  alias: string;
  legacy: SafeMatcherResult;
  structured: SafeMatcherResult;
  hybrid: SafeMatcherResult;
}

interface SafeMatcherResult {
  findings: number;
  status: 'complete' | 'partial' | 'unsupported';
  ambiguous: number;
  nullUnits: number;
  findingsWithWarnings: number;
  warningCodes: Record<string, number>;
}

const POINTS_QUERY = `
  SELECT
    ap.id,
    ap.name,
    COALESCE((
      SELECT t.value
      FROM translation t
      WHERE t.namespace = 'entities'
        AND t.module = 'analysisPoint'
        AND t.submodule = ap.name
        AND t.lang = 'ru'
      LIMIT 1
    ), '') AS translation_ru,
    COALESCE((
      SELECT t.value
      FROM translation t
      WHERE t.namespace = 'entities'
        AND t.module = 'analysisPoint'
        AND t.submodule = ap.name
        AND t.lang = 'en'
      LIMIT 1
    ), '') AS translation_en,
    COALESCE(ap."translationParsing", '') AS parsing_words,
    COALESCE(ap."parsingOrder", 0) AS parsing_order,
    COALESCE((
      SELECT json_agg(
        json_build_object('id', units.id, 'name', units.name)
        ORDER BY units.id
      )
      FROM analysis_point_units point_units
      JOIN "analysisPointUnits" units ON units.id = point_units."unitsId"
      WHERE point_units."pointId" = ap.id
    ), '[]'::json) AS units
  FROM "analysisPoint" ap
  ORDER BY ap.id
`;

async function loadCatalog(): Promise<AnalysisPointWithTranslation[]> {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    logging: false,
  });
  let transaction: Transaction | undefined;
  let transactionFinished = false;
  try {
    transaction = await sequelize.transaction({ readOnly: true });
    await sequelize.query('SET TRANSACTION READ ONLY', { transaction });
    const rows = await sequelize.query<PointRow>(POINTS_QUERY, {
      type: QueryTypes.SELECT,
      transaction,
    });
    await transaction.rollback();
    transactionFinished = true;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      translationRu: row.translation_ru,
      translationEn: row.translation_en,
      parsingWords: row.parsing_words,
      parsingOrder: row.parsing_order,
      units: row.units ?? [],
    }));
  } finally {
    if (transaction && !transactionFinished) await transaction.rollback();
    await sequelize.close();
  }
}

async function extractPdf(path: string): Promise<ExtractTablesResponse> {
  const form = new FormData();
  form.append('file', await readFile(path), {
    filename: 'document.pdf',
    contentType: 'application/pdf',
  });
  form.append('pages', '1-5');
  form.append(
    'table_settings',
    JSON.stringify({
      vertical_strategy: 'lines',
      horizontal_strategy: 'lines',
    }),
  );
  const parserUrl = process.env.PDF_PARSER_URL ?? 'http://127.0.0.1:8000';
  const response = await axios.post<ExtractTablesResponse>(
    `${parserUrl}/extract-tables`,
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: 10 * 1024 * 1024,
      maxContentLength: 5 * 1024 * 1024,
      timeout: 50000,
    },
  );
  return response.data;
}

function safeResult(result: PdfMatcherResult): SafeMatcherResult {
  const warningCodes: Record<string, number> = {};
  for (const warning of result.warnings) {
    warningCodes[warning] = (warningCodes[warning] ?? 0) + 1;
  }
  for (const finding of result.findings) {
    for (const warning of finding.warnings) {
      warningCodes[warning] = (warningCodes[warning] ?? 0) + 1;
    }
  }
  const findingsWithWarnings = result.findings.filter(
    (finding) => finding.warnings.length > 0,
  ).length;
  const status =
    result.findings.length === 0
      ? 'unsupported'
      : result.warnings.length > 0 || findingsWithWarnings > 0
        ? 'partial'
        : 'complete';
  return {
    findings: result.findings.length,
    status,
    ambiguous: result.stats.ambiguous,
    nullUnits: result.findings.filter((finding) => finding.unitId === null)
      .length,
    findingsWithWarnings,
    warningCodes,
  };
}

function aggregate(runs: SafeRunResult[]): {
  files: number;
  legacyFindings: number;
  structuredFindings: number;
  hybridFindings: number;
  legacyStatuses: Record<string, number>;
  structuredStatuses: Record<string, number>;
  hybridStatuses: Record<string, number>;
  structuredAmbiguous: number;
  structuredNullUnits: number;
  structuredFindingsWithWarnings: number;
  hybridAmbiguous: number;
  hybridNullUnits: number;
  hybridFindingsWithWarnings: number;
  structuredWarningCodes: Record<string, number>;
  hybridWarningCodes: Record<string, number>;
} {
  const structuredWarningCodes: Record<string, number> = {};
  const hybridWarningCodes: Record<string, number> = {};
  const legacyStatuses: Record<string, number> = {};
  const structuredStatuses: Record<string, number> = {};
  const hybridStatuses: Record<string, number> = {};
  for (const run of runs) {
    legacyStatuses[run.legacy.status] =
      (legacyStatuses[run.legacy.status] ?? 0) + 1;
    structuredStatuses[run.structured.status] =
      (structuredStatuses[run.structured.status] ?? 0) + 1;
    hybridStatuses[run.hybrid.status] =
      (hybridStatuses[run.hybrid.status] ?? 0) + 1;
    for (const [warning, count] of Object.entries(
      run.structured.warningCodes,
    )) {
      structuredWarningCodes[warning] =
        (structuredWarningCodes[warning] ?? 0) + count;
    }
    for (const [warning, count] of Object.entries(run.hybrid.warningCodes)) {
      hybridWarningCodes[warning] = (hybridWarningCodes[warning] ?? 0) + count;
    }
  }
  return {
    files: runs.length,
    legacyFindings: runs.reduce((sum, run) => sum + run.legacy.findings, 0),
    structuredFindings: runs.reduce(
      (sum, run) => sum + run.structured.findings,
      0,
    ),
    hybridFindings: runs.reduce((sum, run) => sum + run.hybrid.findings, 0),
    legacyStatuses,
    structuredStatuses,
    hybridStatuses,
    structuredAmbiguous: runs.reduce(
      (sum, run) => sum + run.structured.ambiguous,
      0,
    ),
    structuredNullUnits: runs.reduce(
      (sum, run) => sum + run.structured.nullUnits,
      0,
    ),
    structuredFindingsWithWarnings: runs.reduce(
      (sum, run) => sum + run.structured.findingsWithWarnings,
      0,
    ),
    hybridAmbiguous: runs.reduce((sum, run) => sum + run.hybrid.ambiguous, 0),
    hybridNullUnits: runs.reduce((sum, run) => sum + run.hybrid.nullUnits, 0),
    hybridFindingsWithWarnings: runs.reduce(
      (sum, run) => sum + run.hybrid.findingsWithWarnings,
      0,
    ),
    structuredWarningCodes,
    hybridWarningCodes,
  };
}

async function main(): Promise<void> {
  const corpusPath = resolve(process.argv[2] ?? '../testData');
  const entries = (await readdir(corpusPath, { withFileTypes: true }))
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'),
    )
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  if (entries.length !== 10) throw new Error('Unexpected corpus size');

  const catalog = await loadCatalog();
  const legacyMatcher = new LegacyPdfFindingMatcher();
  const structuredMatcher = new StructuredPdfFindingMatcher();
  const hybridMatcher = new HybridPdfFindingMatcher();
  const runs: SafeRunResult[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const extraction = await extractPdf(resolve(corpusPath, entries[index]));
    runs.push({
      alias: `noname_file_${String(index + 1).padStart(2, '0')}`,
      legacy: safeResult(legacyMatcher.match(extraction, catalog)),
      structured: safeResult(structuredMatcher.match(extraction, catalog)),
      hybrid: safeResult(hybridMatcher.match(extraction, catalog)),
    });
  }
  process.stdout.write(
    `${JSON.stringify({ runs, aggregate: aggregate(runs) }, null, 2)}\n`,
  );
}

void main().catch(() => {
  process.stderr.write('PDF matcher corpus run failed\n');
  process.exitCode = 1;
});
