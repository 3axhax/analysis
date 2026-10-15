import type { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import type { PreparedDbRow } from './pdf-corpus-input';
import type { ExpectedPdfPair } from './pdf-pair-benchmark';

export type CorpusCatalogPoint = AnalysisPointWithTranslation;

/** Gold identity is prepared explicitly, never inferred from matcher or aliases. */
export function resolveCorpusExpected(
  rows: PreparedDbRow[],
  catalog: CorpusCatalogPoint[],
) {
  const currentIds = new Set(catalog.map((point) => point.id));
  const pairs: ExpectedPdfPair[] = [];
  const issues: { row: number; code: string }[] = [];
  rows.forEach((row, index) => {
    if (!Number.isSafeInteger(row.id) || row.id <= 0) {
      issues.push({ row: index + 1, code: 'invalid_expected_id' });
    } else if (!currentIds.has(row.id)) {
      issues.push({ row: index + 1, code: 'unknown_expected_id' });
    } else if (typeof row.value !== 'number' || !Number.isFinite(row.value)) {
      issues.push({ row: index + 1, code: 'nonnumeric_expected_value' });
    } else {
      pairs.push({ pointId: row.id, value: row.value });
    }
  });
  return { pairs, issues };
}
