import type { PreparedDbRow } from './pdf-corpus-input';
import type { PdfParsingFinding } from './pdf-matching.types';

export function measurePdfUnits(
  expected: PreparedDbRow[],
  actual: Pick<PdfParsingFinding, 'id' | 'value' | 'unitId'>[],
) {
  const unitRows = expected.filter((row) => row.unitId !== null);
  return {
    expectedUnitRows: unitRows.length,
    correctUnitRows: unitRows.filter((row) =>
      actual.some(
        (found) => found.id === row.pointId && found.unitId === row.unitId,
      ),
    ).length,
    expectedTripleRows: expected.length,
    correctTripleRows: expected.filter((row) =>
      actual.some(
        (found) =>
          found.id === row.pointId &&
          found.value === row.value &&
          found.unitId === row.unitId,
      ),
    ).length,
    expectedNullUnitRows: expected.length - unitRows.length,
    foundUnitFindings: actual.filter((found) => found.unitId !== null).length,
  };
}

export function sumPdfUnitMetrics(rows: ReturnType<typeof measurePdfUnits>[]) {
  const empty = measurePdfUnits([], []);
  for (const row of rows)
    for (const key of Object.keys(empty) as (keyof typeof empty)[])
      empty[key] += row[key];
  return empty;
}
