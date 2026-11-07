import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
import Decimal from 'decimal.js';
import {
  NormalizationInput,
  normalizeToReference,
  UnitNormalizationError,
} from './reference-normalization';

/** Reference source may define only one boundary. No synthetic boundary is returned. */
export function normalizeSourceReference(input: NormalizationInput) {
  const relevant = (row: (typeof input.minimums)[number]) =>
    row.pointId === input.pointId &&
    row.ageId === input.ageId &&
    row.genderId === input.genderId;
  const mins = input.minimums.filter(relevant);
  const maxs = input.maximums.filter(relevant);
  const unitIds = [...new Set([...mins, ...maxs].map((row) => row.unitId))];
  const candidates = (
    unitIds.includes(input.sourceUnitId) ? [input.sourceUnitId] : unitIds
  ).filter(
    (id) =>
      input.allowedUnitIds.includes(id) &&
      (id === input.sourceUnitId ||
        input.rules.some(
          (rule) =>
            rule.active &&
            rule.fromUnitId === input.sourceUnitId &&
            rule.toUnitId === id &&
            (rule.pointId === null || rule.pointId === input.pointId),
        )),
  );
  const shapes = candidates.map((id) => ({
    id,
    min: mins.filter((row) => row.unitId === id),
    max: maxs.filter((row) => row.unitId === id),
  }));
  if (shapes.some((s) => s.min.length > 1 || s.max.length > 1))
    throw new UnitNormalizationError('incomplete_or_duplicate_reference_range');
  if (
    shapes.length &&
    shapes.some(
      (s) =>
        !!s.min.length !== !!shapes[0].min.length ||
        !!s.max.length !== !!shapes[0].max.length,
    )
  )
    throw new UnitNormalizationError('conflicting_reference_ranges');
  const minimums = [...mins];
  const maximums = [...maxs];
  for (const s of shapes) {
    if (s.min.length && !s.max.length) maximums.push(s.min[0]);
    if (s.max.length && !s.min.length) minimums.push(s.max[0]);
  }
  const n = normalizeToReference({ ...input, minimums, maximums });
  const s = shapes.find((item) => item.id === n.calculationUnitId);
  if (!s) throw new UnitNormalizationError('no_convertible_reference_range');
  const hasMin = s.min.length === 1;
  const hasMax = s.max.length === 1;
  const inclusiveLow = hasMin && s.min[0].lowInclusive === true;
  if (shapes.some((shape) => (shape.min[0]?.lowInclusive === true) !== inclusiveLow))
    throw new UnitNormalizationError('conflicting_reference_ranges');
  return {
    ...n,
    calculationMin: hasMin ? n.calculationMin : null,
    calculationMax: hasMax ? n.calculationMax : null,
    displayMin: hasMin ? n.displayMin : null,
    displayMax: hasMax ? n.displayMax : null,
    status: inclusiveLow && new Decimal(n.calculationValue).eq(n.calculationMin)
      ? StatusValue.LOW
      :
      (!hasMin && n.status === StatusValue.LOW) ||
      (!hasMax && n.status === StatusValue.HIGH)
        ? StatusValue.NORMAL
        : n.status,
  };
}
