import type { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import type { PreparedDbRow } from './pdf-corpus-input';
import type { ExpectedPdfPair } from './pdf-pair-benchmark';

export type CorpusCatalogPoint = AnalysisPointWithTranslation;

/** Gold identity is prepared explicitly, never inferred from matcher or aliases. */
export function resolveCorpusExpected(
  rows: PreparedDbRow[],
  catalog: CorpusCatalogPoint[],
) {
  const currentPoints = new Map(catalog.map((point) => [point.id, point]));
  const pairs: ExpectedPdfPair[] = [];
  const issues: { row: number; code: string }[] = [];
  rows.forEach((row, index) => {
    if (!Number.isSafeInteger(row.pointId) || row.pointId <= 0) {
      issues.push({ row: index + 1, code: 'invalid_expected_id' });
    } else if (!currentPoints.has(row.pointId)) {
      issues.push({ row: index + 1, code: 'unknown_expected_id' });
    } else if (
      row.unitId !== null &&
      !currentPoints
        .get(row.pointId)!
        .units?.some((unit) => unit.id === row.unitId)
    ) {
      issues.push({
        row: index + 1,
        code: 'unit_not_allowed_for_expected_point',
      });
    } else if (typeof row.value !== 'number' || !Number.isFinite(row.value)) {
      issues.push({ row: index + 1, code: 'nonnumeric_expected_value' });
    } else {
      pairs.push({ pointId: row.pointId, value: row.value });
    }
  });
  return { pairs, issues };
}
