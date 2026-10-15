import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LegacyPdfFindingMatcher } from '../src/analysisResult/pdf-finding-matcher';
import {
  measurePdfPairs,
  sumPdfPairMetrics,
} from '../src/analysisResult/pdf-pair-benchmark';
import {
  isPreparedRows,
  isPreparedDbRows,
  isPreparedExtraction,
} from '../src/analysisResult/pdf-corpus-input';
import {
  resolveCorpusExpected,
  CorpusCatalogPoint,
} from '../src/analysisResult/pdf-corpus-expected';
import type { PdfFindingMatcher } from '../src/analysisResult/pdf-matching.types';
import { loadCurrentCorpusCatalog } from './nest-corpus-catalog';

const preparedFolders = [
  { folder: 'sources', suffix: '.json', missing: 'missing_source' },
  {
    folder: 'python-results',
    suffix: '-python.json',
    missing: 'missing_python_json',
  },
  { folder: 'DB-results', suffix: '-db.json', missing: 'missing_db_json' },
] as const;

async function files(directory: string) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

export async function runNestCorpus(
  root: string,
  catalog: CorpusCatalogPoint[],
  matcher: PdfFindingMatcher = new LegacyPdfFindingMatcher(),
) {
  const pdfs = new Set(
    (await files(root))
      .filter((name) => /\.pdf$/i.test(name))
      .map((name) => name.slice(0, -4)),
  );
  const prepared = await Promise.all(
    preparedFolders.map(async (spec) => ({
      ...spec,
      names: new Set(
        (await files(resolve(root, spec.folder)))
          .filter((name) => name.endsWith(spec.suffix))
          .map((name) => name.slice(0, -spec.suffix.length)),
      ),
    })),
  );
  const bases = [
    ...new Set([...pdfs, ...prepared.flatMap((spec) => [...spec.names])]),
  ].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const warnings: { alias: string; code: string }[] = [];
  const runs: {
    alias: string;
    status: string;
    expectedRows?: number;
    unresolvedExpectedRows?: number;
    issues?: { row: number; code: string }[];
    metrics?: ReturnType<typeof measurePdfPairs>;
    warningCodes?: string[];
    unsupported?: number;
    findings?: number;
  }[] = [];
  for (const [index, base] of bases.entries()) {
    const alias = `doc-${String(index + 1).padStart(2, '0')}`;
    const missing = [
      ...(!pdfs.has(base) ? ['missing_pdf'] : []),
      ...prepared
        .filter((spec) => !spec.names.has(base))
        .map((spec) => spec.missing),
    ];
    if (missing.length) {
      warnings.push(...missing.map((code) => ({ alias, code })));
      runs.push({ alias, status: 'incomplete' });
      continue;
    }
    let source: unknown, extraction: unknown, expected: unknown;
    try {
      [source, extraction, expected] = await Promise.all(
        preparedFolders.map(
          async (spec) =>
            JSON.parse(
              await readFile(
                resolve(root, spec.folder, base + spec.suffix),
                'utf8',
              ),
            ) as unknown,
        ),
      );
    } catch {
      warnings.push({ alias, code: 'invalid_json' });
      runs.push({ alias, status: 'invalid' });
      continue;
    }
    if (
      !isPreparedRows(source, false) ||
      !isPreparedDbRows(expected) ||
      !isPreparedExtraction(extraction)
    ) {
      warnings.push({ alias, code: 'invalid_schema' });
      runs.push({ alias, status: 'invalid' });
      continue;
    }
    // Every complete valid prepared input exercises the current matcher, even
    // when prepared gold IDs are no longer present in the current database.
    const result = matcher.match(extraction, catalog);
    const resolved = resolveCorpusExpected(expected, catalog);
    if (resolved.issues.length) {
      warnings.push({ alias, code: 'unresolved_expected' });
      runs.push({
        alias,
        status: 'unresolved_expected',
        expectedRows: expected.length,
        unresolvedExpectedRows: resolved.issues.length,
        issues: resolved.issues,
        findings: result.findings.length,
        warningCodes: result.warnings,
      });
      continue;
    }
    runs.push({
      alias,
      status: 'tested',
      expectedRows: expected.length,
      metrics: measurePdfPairs(resolved.pairs, result.findings),
      warningCodes: result.warnings,
      unsupported: source.length - expected.length,
    });
  }
  const tested = runs.filter((run) => run.metrics !== undefined);
  return {
    catalogSource: 'current_database',
    catalogPoints: catalog.length,
    documents: bases.length,
    files: runs.filter(
      (run) => run.status === 'tested' || run.status === 'unresolved_expected',
    ).length,
    scoredFiles: tested.length,
    knownExpectedRows: runs.reduce(
      (sum, run) => sum + (run.expectedRows ?? 0),
      0,
    ),
    warnings,
    runs,
    unscoredExpectedRows: runs
      .filter((run) => run.status === 'unresolved_expected')
      .reduce((sum, run) => sum + (run.expectedRows ?? 0), 0),
    totals: sumPdfPairMetrics(tested.map((run) => run.metrics!)),
  };
}

export async function main() {
  if (process.argv.slice(2).length > 1)
    throw new Error('Only the prepared input directory is supported');
  const root = resolve(process.argv[2] ?? '../testData');
  if (!(await stat(root)).isDirectory())
    throw new Error('Input directory unavailable');
  const catalog = await loadCurrentCorpusCatalog();
  process.stdout.write(
    JSON.stringify(await runNestCorpus(root, catalog), null, 2) + '\n',
  );
}

if (require.main === module)
  void main().catch(() => {
    process.stderr.write(
      'Nest corpus check failed; sensitive details suppressed\n',
    );
    process.exitCode = 1;
  });
