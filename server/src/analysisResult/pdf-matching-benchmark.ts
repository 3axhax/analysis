import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';
import { LegacyPdfFindingMatcher } from './pdf-finding-matcher';
import { PdfFindingMatcher } from './pdf-matching.types';

export interface PdfBenchmarkExpectedFinding {
  pointId: number;
  value: number;
  unitId: number | null;
}

export interface PdfBenchmarkCase {
  extraction: ExtractTablesResponse;
  expected: PdfBenchmarkExpectedFinding[];
}

export interface PdfBenchmarkDataset {
  catalog: AnalysisPointWithTranslation[];
  cases: PdfBenchmarkCase[];
}

export interface PdfBenchmarkMetrics {
  documents: number;
  documentsExact: number;
  expectedPoints: number;
  foundPoints: number;
  truePositivePoints: number;
  pointPrecision: number;
  pointRecall: number;
  exactValues: number;
  valueAccuracy: number;
  expectedUnits: number;
  exactUnits: number;
  unitAccuracy: number;
  unitCoverage: number;
  errors: {
    missingPoint: number;
    unexpectedPoint: number;
    wrongValue: number;
    wrongUnit: number;
  };
}

const emptyMetrics = (): PdfBenchmarkMetrics => ({
  documents: 0,
  documentsExact: 0,
  expectedPoints: 0,
  foundPoints: 0,
  truePositivePoints: 0,
  pointPrecision: 0,
  pointRecall: 0,
  exactValues: 0,
  valueAccuracy: 0,
  expectedUnits: 0,
  exactUnits: 0,
  unitAccuracy: 0,
  unitCoverage: 0,
  errors: {
    missingPoint: 0,
    unexpectedPoint: 0,
    wrongValue: 0,
    wrongUnit: 0,
  },
});

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(4));
}

function sameValue(actual: number, expected: number): boolean {
  return (
    Math.abs(actual - expected) <= Math.max(1e-9, Math.abs(expected) * 1e-9)
  );
}

function measure(
  matcher: PdfFindingMatcher,
  dataset: PdfBenchmarkDataset,
): PdfBenchmarkMetrics {
  const metrics = emptyMetrics();
  metrics.documents = dataset.cases.length;
  let matchedUnits = 0;

  for (const benchmarkCase of dataset.cases) {
    const actual = matcher.match(
      benchmarkCase.extraction,
      dataset.catalog,
    ).findings;
    const actualByPoint = new Map(
      actual.map((finding) => [finding.id, finding]),
    );
    const expectedByPoint = new Map(
      benchmarkCase.expected.map((finding) => [finding.pointId, finding]),
    );
    metrics.expectedPoints += expectedByPoint.size;
    metrics.foundPoints += actualByPoint.size;
    let documentExact = actualByPoint.size === expectedByPoint.size;

    for (const [pointId, expected] of expectedByPoint) {
      const found = actualByPoint.get(pointId);
      if (!found) {
        metrics.errors.missingPoint += 1;
        documentExact = false;
        continue;
      }
      metrics.truePositivePoints += 1;
      if (sameValue(found.value, expected.value)) {
        metrics.exactValues += 1;
      } else {
        metrics.errors.wrongValue += 1;
        documentExact = false;
      }
      if (expected.unitId !== null) {
        metrics.expectedUnits += 1;
        if (found.unitId !== null) matchedUnits += 1;
        if (found.unitId === expected.unitId) {
          metrics.exactUnits += 1;
        } else {
          metrics.errors.wrongUnit += 1;
          documentExact = false;
        }
      }
    }

    for (const pointId of actualByPoint.keys()) {
      if (!expectedByPoint.has(pointId)) {
        metrics.errors.unexpectedPoint += 1;
        documentExact = false;
      }
    }
    if (documentExact) metrics.documentsExact += 1;
  }

  metrics.pointPrecision = ratio(
    metrics.truePositivePoints,
    metrics.foundPoints,
  );
  metrics.pointRecall = ratio(
    metrics.truePositivePoints,
    metrics.expectedPoints,
  );
  metrics.valueAccuracy = ratio(
    metrics.exactValues,
    metrics.truePositivePoints,
  );
  metrics.unitAccuracy = ratio(metrics.exactUnits, metrics.expectedUnits);
  metrics.unitCoverage = ratio(matchedUnits, metrics.expectedUnits);
  return metrics;
}

export function benchmarkLegacyPdfMatcher(
  dataset: PdfBenchmarkDataset,
): PdfBenchmarkMetrics {
  return measure(new LegacyPdfFindingMatcher(), dataset);
}

export function isPdfMatcherDataset(
  value: unknown,
): value is PdfBenchmarkDataset {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<PdfBenchmarkDataset>;
  return Array.isArray(candidate.catalog) && Array.isArray(candidate.cases);
}
