import { PdfNameMatch } from './pdf-name-index';
import { PdfRowEvidence } from './pdf-row-evidence';
import { PdfParsingFinding } from './pdf-matching.types';
import { PdfUnitEvidence } from './pdf-unit-parser';

export interface PairCandidate {
  name: PdfNameMatch;
  value: number;
  row: PdfRowEvidence;
  valueStart: number;
  rule: string;
  unitEvidence?: PdfUnitEvidence;
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
    const evidence = group.flatMap((candidate) =>
      candidate.unitEvidence ? [candidate.unitEvidence] : [],
    );
    const observed = new Set(
      evidence.map((unit) => unit.observed).filter(Boolean),
    );
    const recognized = [
      ...new Map(
        evidence
          .filter((unit) => unit.unitId !== null)
          .map((unit) => [unit.unitId, unit]),
      ).values(),
    ];
    const conflicting = observed.size > 1 || recognized.length > 1;
    const uncertain = evidence.some(
      (unit) => unit.warning === 'ambiguous_unit',
    );
    const unit =
      !conflicting && !uncertain && recognized.length === 1
        ? recognized[0]
        : undefined;
    const unitWarnings = conflicting
      ? ['conflicting_units']
      : unit
        ? []
        : [
            ...new Set(
              evidence
                .map((unit) => unit.warning)
                .filter((warning): warning is string => Boolean(warning)),
            ),
          ];
    findings.push({
      id: first.name.point.id,
      name: first.name.point.name,
      value: first.value,
      unitId: unit?.unitId ?? null,
      unit: unit?.unit ?? null,
      unitText: unit?.unitText ?? null,
      confidence: 0.5,
      page: first.row.page,
      warnings: unitWarnings,
    });
  }
  return { findings: findings.sort((a, b) => a.id - b.id), conflicts };
}
