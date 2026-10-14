import axios from 'axios';
import FormData from 'form-data';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFParse } from 'pdf-parse';
import { QueryTypes, Sequelize, Transaction } from 'sequelize';
import { AnalysisPointWithTranslation } from '../src/analysisPoint/analysisPoint.service';
import {
  canonicalPdfText,
  LegacyPdfFindingMatcher,
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
  sourceParameterRows: number;
  pythonSourceParameterMentions: number;
  visibleParameterRows: number;
  exactCatalogMentions: SafeMentionResult;
  pythonSourceCatalogMentions: SafeMentionResult;
  pythonRecognizedMentions: number;
  legacy: SafeMatcherResult;
}

interface SafeMentionResult {
  confirmed: number;
  includingCollisions: number;
}

interface MentionedPointIds {
  confirmed: Set<number>;
  includingCollisions: Set<number>;
}

interface SafeMatcherResult {
  findings: number;
  logicalRows: number;
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
    logicalRows: result.stats.logicalRows,
    status,
    ambiguous: result.stats.ambiguous,
    nullUnits: result.findings.filter((finding) => finding.unitId === null)
      .length,
    findingsWithWarnings,
    warningCodes,
  };
}

function aggregate(runs: SafeRunResult[]) {
  const legacyStatuses: Record<string, number> = {};
  const legacyWarningCodes: Record<string, number> = {};
  for (const run of runs) {
    legacyStatuses[run.legacy.status] =
      (legacyStatuses[run.legacy.status] ?? 0) + 1;
    for (const [warning, count] of Object.entries(run.legacy.warningCodes)) {
      legacyWarningCodes[warning] = (legacyWarningCodes[warning] ?? 0) + count;
    }
  }
  return {
    files: runs.length,
    legacyFindings: runs.reduce((sum, run) => sum + run.legacy.findings, 0),
    legacyStatuses,
    legacyNullUnits: runs.reduce((sum, run) => sum + run.legacy.nullUnits, 0),
    legacyWarningCodes,
    exactCatalogMentionsConfirmed: runs.reduce(
      (sum, run) => sum + run.exactCatalogMentions.confirmed,
      0,
    ),
    exactCatalogMentionsIncludingCollisions: runs.reduce(
      (sum, run) => sum + run.exactCatalogMentions.includingCollisions,
      0,
    ),
    visibleParameterRows: runs.reduce(
      (sum, run) => sum + run.visibleParameterRows,
      0,
    ),
  };
}

function visibleParameterNames(extraction: ExtractTablesResponse): string[] {
  return parameterNamesFromRows(
    extraction.tables
      .flatMap((page) => page.tables)
      .flatMap((table) => table.data),
  );
}

function parameterNamesFromRows(rows: string[][]): string[] {
  const names = new Set<string>();
  const metadataLabels = [
    'возраст',
    'дата',
    'время',
    'заказ',
    'образец',
    'пациент',
    'пол',
    'инз',
    'врач',
    'ооо',
    'доктор',
    'телефон',
    'стр',
    'челябинск',
    'улица',
    'ул',
    'набережная',
    'адрес',
  ];
  for (const row of rows) {
    if (row.length === 0) continue;
    const firstNumberIndex = (row[0] ?? '').search(/[-+]?\d/u);
    const singleCell = row.length === 1 && firstNumberIndex > 0;
    const name = canonicalPdfText(
      singleCell ? row[0].slice(0, firstNumberIndex) : (row[0] ?? ''),
    );
    const result = singleCell
      ? row[0].slice(firstNumberIndex).trim()
      : row.slice(1).join(' ').trim();
    if (!/[\p{L}]/u.test(name) || !/[-+]?\d+(?:[.,]\d+)?/u.test(result)) {
      continue;
    }
    if (
      /^\d{1,2}[./]\d{1,2}[./]\d{2,4}/u.test(result) ||
      /^\d{1,2}:\d{2}/u.test(result) ||
      metadataLabels.some((label) => ` ${name} `.includes(` ${label} `))
    ) {
      continue;
    }
    names.add(name);
  }
  const normalizedNames = [...names];
  return normalizedNames.filter(
    (name) =>
      !normalizedNames.some(
        (candidate) =>
          candidate !== name &&
          name.length > candidate.length + 20 &&
          ` ${name} `.includes(` ${candidate} `),
      ),
  );
}

function sourceParameterNames(text: string): string[] {
  return parameterNamesFromRows(
    text.split(/\r?\n/u).map((line) => [line.trim()]),
  );
}

function catalogAliases(point: AnalysisPointWithTranslation): string[] {
  return [
    ...point.parsingWords.split('_'),
    point.translationRu,
    point.translationEn,
    point.name.replace(/[-_]/gu, ' '),
  ]
    .map(canonicalPdfText)
    .filter((alias) => alias.length >= 2);
}

function mentionedPointIds(
  text: string,
  points: AnalysisPointWithTranslation[],
): MentionedPointIds {
  const canonicalText = ` ${canonicalPdfText(text)} `;
  const aliasOwners = new Map<string, Set<number>>();
  for (const point of points) {
    for (const alias of catalogAliases(point)) {
      const owners = aliasOwners.get(alias) ?? new Set<number>();
      owners.add(point.id);
      aliasOwners.set(alias, owners);
    }
  }
  const confirmed = new Set<number>();
  const includingCollisions = new Set<number>();
  for (const point of points) {
    for (const alias of catalogAliases(point)) {
      if (!canonicalText.includes(` ${alias} `)) continue;
      includingCollisions.add(point.id);
      if (aliasOwners.get(alias)?.size === 1) confirmed.add(point.id);
    }
  }
  return { confirmed, includingCollisions };
}

function safeMentionResult(pointIds: MentionedPointIds): SafeMentionResult {
  return {
    confirmed: pointIds.confirmed.size,
    includingCollisions: pointIds.includingCollisions.size,
  };
}

function extractionText(extraction: ExtractTablesResponse): string {
  return extraction.tables
    .flatMap((page) => page.tables)
    .flatMap((table) => table.data)
    .flat()
    .join(' ');
}

async function sourcePdfText(path: string): Promise<string> {
  const parser = new PDFParse({ data: await readFile(path) });
  try {
    const result = await parser.getText({ first: 5 });
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function main(): Promise<void> {
  const corpusPath = resolve(process.argv[2] ?? '../testData');
  const entries = (await readdir(corpusPath, { withFileTypes: true }))
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'),
    )
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  if (entries.length === 0) throw new Error('Empty PDF corpus');

  const catalog = await loadCatalog();
  const legacyMatcher = new LegacyPdfFindingMatcher();
  const runs = new Array<SafeRunResult>(entries.length);
  let nextIndex = 0;
  const worker = async (): Promise<void> => {
    while (nextIndex < entries.length) {
      const index = nextIndex;
      nextIndex += 1;
      const alias = entries[index];
      const extraction = await extractPdf(resolve(corpusPath, entries[index]));
      const visibleNames = visibleParameterNames(extraction);
      const sourceText = await sourcePdfText(
        resolve(corpusPath, entries[index]),
      );
      const sourceNames = sourceParameterNames(sourceText);
      const canonicalExtraction = ` ${canonicalPdfText(
        extractionText(extraction),
      )} `;
      const sourceMentionedPointIds = mentionedPointIds(sourceText, catalog);
      const pythonMentionedIds = mentionedPointIds(
        extractionText(extraction),
        catalog,
      );
      const legacy = legacyMatcher.match(extraction, catalog);
      runs[index] = {
        alias,
        sourceParameterRows: sourceNames.length,
        pythonSourceParameterMentions: sourceNames.filter((name) =>
          canonicalExtraction.includes(` ${name} `),
        ).length,
        visibleParameterRows: visibleNames.length,
        exactCatalogMentions: safeMentionResult(sourceMentionedPointIds),
        pythonSourceCatalogMentions: {
          confirmed: [...sourceMentionedPointIds.confirmed].filter((pointId) =>
            pythonMentionedIds.includingCollisions.has(pointId),
          ).length,
          includingCollisions: [
            ...sourceMentionedPointIds.includingCollisions,
          ].filter((pointId) =>
            pythonMentionedIds.includingCollisions.has(pointId),
          ).length,
        },
        pythonRecognizedMentions: legacy.findings.filter((finding) =>
          pythonMentionedIds.includingCollisions.has(finding.id),
        ).length,
        legacy: safeResult(legacy),
      };
      process.stderr.write(`${alias}: processed\n`);
    }
  };
  await Promise.all([worker(), worker()]);
  process.stdout.write(
    `${JSON.stringify(
      { catalogPoints: catalog.length, runs, aggregate: aggregate(runs) },
      null,
      2,
    )}\n`,
  );
}

void main().catch(() => {
  process.stderr.write('PDF matcher corpus run failed\n');
  process.exitCode = 1;
});
