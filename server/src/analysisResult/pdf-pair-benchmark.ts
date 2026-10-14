import { PdfParsingFinding } from './pdf-matching.types';

export interface ExpectedPdfPair {
  pointId: number;
  value: number;
  variant?: string;
}

export interface PdfPairMetrics {
  expectedPoints: number;
  foundPoints: number;
  correctPoints: number;
  expectedRows: number;
  correctRows: number;
  expectedPairs: number;
  foundPairs: number;
  correctPairs: number;
  duplicateExpectedRows: number;
  missingPoints: number;
  extraPoints: number;
  wrongValues: number;
}

export function measurePdfPairs(
  expected: ExpectedPdfPair[],
  actual: Pick<PdfParsingFinding, 'id' | 'value'>[],
): PdfPairMetrics {
  const expectedIds = new Set(expected.map((pair) => pair.pointId));
  const actualIds = new Set(actual.map((pair) => pair.id));
  const key = (id: number, value: number) => `${id}:${value}`;
  const expectedPairs = new Set(expected.map((p) => key(p.pointId, p.value)));
  const actualPairs = new Set(actual.map((p) => key(p.id, p.value)));
  return {
    expectedPoints: expectedIds.size,
    foundPoints: actualIds.size,
    correctPoints: [...actualIds].filter((id) => expectedIds.has(id)).length,
    expectedRows: expected.length,
    correctRows: expected.filter((p) =>
      actualPairs.has(key(p.pointId, p.value)),
    ).length,
    expectedPairs: expectedPairs.size,
    foundPairs: actualPairs.size,
    correctPairs: [...actualPairs].filter((p) => expectedPairs.has(p)).length,
    duplicateExpectedRows: expected.length - expectedPairs.size,
    missingPoints: [...expectedIds].filter((id) => !actualIds.has(id)).length,
    extraPoints: [...actualIds].filter((id) => !expectedIds.has(id)).length,
    wrongValues: [...actualPairs].filter(
      (p) => !expectedPairs.has(p) && expectedIds.has(Number(p.split(':')[0])),
    ).length,
  };
}

export function sumPdfPairMetrics(rows: PdfPairMetrics[]): PdfPairMetrics {
  const keys: (keyof PdfPairMetrics)[] = [
    'expectedPoints',
    'foundPoints',
    'correctPoints',
    'expectedRows',
    'correctRows',
    'expectedPairs',
    'foundPairs',
    'correctPairs',
    'duplicateExpectedRows',
    'missingPoints',
    'extraPoints',
    'wrongValues',
  ];
  return Object.fromEntries(
    keys.map((key) => [key, rows.reduce((sum, row) => sum + row[key], 0)]),
  ) as unknown as PdfPairMetrics;
}
