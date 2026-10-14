import { readFile, readdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { LegacyPdfFindingMatcher } from '../src/analysisResult/pdf-finding-matcher';
import {
  measurePdfPairs,
  sumPdfPairMetrics,
  ExpectedPdfPair,
} from '../src/analysisResult/pdf-pair-benchmark';
import { PdfFindingMatcher } from '../src/analysisResult/pdf-matching.types';
import { AnalysisPointWithTranslation } from '../src/analysisPoint/analysisPoint.service';
import {
  isPreparedRows,
  isPreparedExtraction,
} from '../src/analysisResult/pdf-corpus-input';

interface CorpusCase {
  base: string;
  alias: string;
  expected: ExpectedPdfPair[];
  sourceCount: number;
  fingerprint: string;
  expectedFingerprint: string;
  structure: string;
  subset: 'development' | 'holdout';
}

async function main() {
  const root = resolve(process.argv[2] ?? '../testData');
  const snapshot = resolve(process.argv[3] ?? `${root}/.nest-benchmark`);
  const mode = process.argv[4] ?? 'current';
  const subset = process.argv[5] ?? 'all';
  if (
    !['baseline', 'current'].includes(mode) ||
    !['all', 'development', 'holdout'].includes(subset)
  )
    throw new Error('Invalid selection');
  const catalog = JSON.parse(
    await readFile(`${snapshot}/catalog.json`, 'utf8'),
  ) as AnalysisPointWithTranslation[];
  const manifest = JSON.parse(
    await readFile(`${snapshot}/expected.json`, 'utf8'),
  ) as { cases: CorpusCase[] };
  let matcher: PdfFindingMatcher = new LegacyPdfFindingMatcher();
  if (mode === 'baseline') {
    const module = createRequire(__filename)(`${snapshot}/baseline.cjs`) as {
      LegacyPdfFindingMatcher: new () => PdfFindingMatcher;
    };
    matcher = new module.LegacyPdfFindingMatcher();
  }
  const fileNames = new Set(
    (await readdir(root))
      .filter((n) => n.toLowerCase().endsWith('.pdf'))
      .map((n) => n.slice(0, -4)),
  );
  const warnings: { alias: string; code: string }[] = [];
  const runs: {
    alias: string;
    subset: string;
    fingerprint: string;
    metrics: ReturnType<typeof measurePdfPairs>;
    warningCodes: string[];
    unsupported: number;
  }[] = [];
  for (const item of manifest.cases) {
    if (subset !== 'all' && item.subset !== subset) continue;
    if (
      basename(item.base) !== item.base ||
      item.base === '..' ||
      !Array.isArray(item.expected) ||
      item.expected.some(
        (e) =>
          !Number.isInteger(e.pointId) ||
          typeof e.value !== 'number' ||
          !Number.isFinite(e.value),
      )
    ) {
      warnings.push({ alias: item.alias, code: 'invalid_expected_snapshot' });
      continue;
    }
    if (!fileNames.has(item.base)) {
      warnings.push({ alias: item.alias, code: 'missing_pdf' });
      continue;
    }
    const paths = [
      `${root}/sources/${item.base}.json`,
      `${root}/python-results/${item.base}-python.json`,
      `${root}/DB-results/${item.base}-db.json`,
    ];
    let bytes: Buffer[];
    try {
      bytes = await Promise.all(paths.map((p) => readFile(p)));
    } catch {
      warnings.push({ alias: item.alias, code: 'missing_prepared_json' });
      continue;
    }
    let source: unknown, extraction: unknown, expected: unknown;
    try {
      [source, extraction, expected] = bytes.map(
        (b): unknown => JSON.parse(b.toString()) as unknown,
      );
    } catch {
      warnings.push({ alias: item.alias, code: 'invalid_json' });
      continue;
    }
    if (
      !isPreparedRows(source, false) ||
      !isPreparedRows(expected, true) ||
      !isPreparedExtraction(extraction)
    ) {
      warnings.push({ alias: item.alias, code: 'invalid_schema' });
      continue;
    }
    const fingerprint = createHash('sha256')
      .update(bytes[1])
      .update(bytes[0])
      .digest('hex');
    if (
      fingerprint !== item.fingerprint ||
      createHash('sha256').update(bytes[2]).digest('hex') !==
        item.expectedFingerprint ||
      expected.length !== item.expected.length
    ) {
      warnings.push({ alias: item.alias, code: 'snapshot_inputs_changed' });
      continue;
    }
    const result = matcher.match(extraction, catalog);
    runs.push({
      alias: item.alias,
      subset: item.subset,
      fingerprint,
      metrics: measurePdfPairs(item.expected, result.findings),
      warningCodes: result.warnings,
      unsupported: source.length - expected.length,
    });
  }
  const seen = new Set<string>();
  const uniqueRuns = runs.filter((run) => {
    if (seen.has(run.fingerprint)) return false;
    seen.add(run.fingerprint);
    return true;
  });
  for (const base of fileNames)
    if (!manifest.cases.some((c) => c.base === base))
      warnings.push({ alias: 'unmapped', code: 'missing_expected_snapshot' });
  for (const [folder, suffix] of [
    ['sources', '.json'],
    ['python-results', '-python.json'],
    ['DB-results', '-db.json'],
  ]) {
    for (const name of await readdir(`${root}/${folder}`))
      if (
        name.endsWith(suffix) &&
        !fileNames.has(name.slice(0, -suffix.length))
      )
        warnings.push({ alias: 'orphan', code: `missing_pdf_for_${folder}` });
  }
  process.stdout.write(
    JSON.stringify(
      {
        mode,
        subset,
        files: runs.length,
        warnings,
        runs: runs.map((r) => ({
          alias: r.alias,
          subset: r.subset,
          metrics: r.metrics,
          warningCodes: r.warningCodes,
          unsupported: r.unsupported,
        })),
        totals: sumPdfPairMetrics(runs.map((r) => r.metrics)),
        uniqueInputTotals: sumPdfPairMetrics(uniqueRuns.map((r) => r.metrics)),
      },
      null,
      2,
    ) + '\n',
  );
}

void main().catch(() => {
  process.stderr.write(
    'Nest corpus check failed; sensitive details suppressed\n',
  );
  process.exitCode = 1;
});
