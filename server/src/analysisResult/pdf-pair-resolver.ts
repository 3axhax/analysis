import { PdfNameMatch } from './pdf-name-index';
import { PdfRowEvidence } from './pdf-row-evidence';
import { PdfParsingFinding } from './pdf-matching.types';

export interface PairCandidate {
  name: PdfNameMatch;
  value: number;
  row: PdfRowEvidence;
  valueStart: number;
  rule: string;
}

export function resolvePdfPairs(candidates: PairCandidate[]): {
  findings: PdfParsingFinding[];
  conflicts: number;
} {
  const points = new Map<number, PairCandidate[]>();
  for (const candidate of candidates) {
    const group = points.get(candidate.name.point.id) ?? [];
    group.push(candidate);
    points.set(candidate.name.point.id, group);
  }
  const findings: PdfParsingFinding[] = [];
  let conflicts = 0;
  for (const group of points.values()) {
    if (
      new Set(group.map((p) => p.value)).size > 1 ||
      new Set(group.map((p) => p.name.variant).filter(Boolean)).size > 1
    ) {
      conflicts++;
      continue;
    }
    const first = [...group].sort((a, b) => a.row.page - b.row.page)[0];
    findings.push({
      id: first.name.point.id,
      name: first.name.point.name,
      value: first.value,
      unitId: null,
      unit: null,
      confidence: 0.5,
      page: first.row.page,
      warnings: [],
    });
  }
  return { findings: findings.sort((a, b) => a.id - b.id), conflicts };
}
