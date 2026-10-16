import Decimal from 'decimal.js';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

// Max 38 significant digits per input, max 38 per coefficient. Products fit exactly.
const D = Decimal.clone({ precision: 80, rounding: Decimal.ROUND_HALF_UP });
export class UnitNormalizationError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}
export interface ReferenceBound {
  pointId: number;
  ageId: number;
  genderId: number;
  unitId: number;
  value: number | string;
}
export interface UnitConversionRule {
  id: number;
  fromUnitId: number;
  toUnitId: number;
  coefficient: string;
  version: number;
  active: boolean;
  pointId: number | null;
}
export interface NormalizationInput {
  pointId: number;
  ageId: number;
  genderId: number;
  sourceUnitId: number;
  sourceValue: number | string;
  allowedUnitIds: number[];
  minimums: ReferenceBound[];
  maximums: ReferenceBound[];
  rules: UnitConversionRule[];
}
function decimal(value: number | string, code: string) {
  const raw = typeof value === 'number' ? String(value) : value;
  if (
    typeof raw !== 'string' ||
    raw.length > 100 ||
    !/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:[eE][+-]?\d{1,3})?$/.test(raw)
  )
    throw new UnitNormalizationError(code);
  const parsed = new D(raw.replace(',', '.'));
  if (
    !parsed.isFinite() ||
    parsed.sd() > 38 ||
    parsed.dp() > 18 ||
    parsed.abs().gte('1e20')
  )
    throw new UnitNormalizationError(code);
  return parsed;
}

/** Technical value validation only; independent of norms and conversion rules. */
export function sourceMeasurementValue(value: unknown): string {
  if (typeof value !== 'number' && typeof value !== 'string')
    throw new UnitNormalizationError('invalid_source_value');
  const source = decimal(value, 'invalid_source_value');
  if (source.lt(0)) throw new UnitNormalizationError('invalid_source_value');
  return source.toFixed();
}

/** No DB writes; chooses a range for the exact clinical context, not a point-wide unit. */
export function normalizeToReference(input: NormalizationInput) {
  for (const id of [
    input.pointId,
    input.ageId,
    input.genderId,
    input.sourceUnitId,
  ])
    if (!Number.isSafeInteger(id) || id <= 0)
      throw new UnitNormalizationError('invalid_context');
  if (!input.allowedUnitIds.includes(input.sourceUnitId))
    throw new UnitNormalizationError('source_unit_not_allowed');
  const source = decimal(input.sourceValue, 'invalid_source_value');
  if (source.lt(0)) throw new UnitNormalizationError('invalid_source_value');
  const relevant = (row: ReferenceBound) =>
    row.pointId === input.pointId &&
    row.ageId === input.ageId &&
    row.genderId === input.genderId;
  const mins = input.minimums.filter(relevant),
    maxs = input.maximums.filter(relevant);
  const units = [...new Set([...mins, ...maxs].map((row) => row.unitId))];
  const exact = units.includes(input.sourceUnitId);
  const candidates: {
    unitId: number;
    min: Decimal;
    max: Decimal;
    k: Decimal;
    rule: UnitConversionRule | null;
  }[] = [];
  for (const unitId of (exact ? [input.sourceUnitId] : units).sort(
    (a, b) => a - b,
  )) {
    if (!input.allowedUnitIds.includes(unitId)) continue;
    let rule: UnitConversionRule | null = null;
    let k = new D(1);
    if (unitId !== input.sourceUnitId) {
      const rules = input.rules.filter(
        (r) =>
          r.active &&
          r.fromUnitId === input.sourceUnitId &&
          r.toUnitId === unitId &&
          (r.pointId === null || r.pointId === input.pointId),
      );
      if (!rules.length) continue;
      if (rules.length !== 1)
        throw new UnitNormalizationError('ambiguous_conversion_rule');
      rule = rules[0];
      if (
        !Number.isSafeInteger(rule.id) ||
        rule.id <= 0 ||
        !Number.isSafeInteger(rule.version) ||
        rule.version <= 0
      )
        throw new UnitNormalizationError('invalid_conversion_rule');
      k = decimal(rule.coefficient, 'invalid_conversion_coefficient');
      if (k.lte(0))
        throw new UnitNormalizationError('invalid_conversion_coefficient');
    }
    const lo = mins.filter((r) => r.unitId === unitId),
      hi = maxs.filter((r) => r.unitId === unitId);
    if (lo.length !== 1 || hi.length !== 1)
      throw new UnitNormalizationError(
        'incomplete_or_duplicate_reference_range',
      );
    const min = decimal(lo[0].value, 'invalid_reference_range'),
      max = decimal(hi[0].value, 'invalid_reference_range');
    if (min.gt(max))
      throw new UnitNormalizationError('reversed_reference_range');
    candidates.push({ unitId, min, max, k, rule });
  }
  if (!candidates.length)
    throw new UnitNormalizationError('no_convertible_reference_range');
  const selected = candidates[0];
  // Compare cross products; inverse division may recur and must not decide equality.
  if (
    candidates.some(
      (c) =>
        !c.min.times(selected.k).eq(selected.min.times(c.k)) ||
        !c.max.times(selected.k).eq(selected.max.times(c.k)),
    )
  )
    throw new UnitNormalizationError('conflicting_reference_ranges');
  const calculation = source.times(selected.k);
  if (!calculation.isFinite() || calculation.abs().gte('1e40'))
    throw new UnitNormalizationError('conversion_overflow');
  return {
    sourceValue: source.toFixed(),
    sourceUnitId: input.sourceUnitId,
    calculationValue: calculation.toFixed(),
    calculationUnitId: selected.unitId,
    conversionRuleId: selected.rule?.id ?? null,
    conversionRuleVersion: selected.rule?.version ?? null,
    appliedCoefficient: selected.k.toFixed(),
    calculationMin: selected.min.toFixed(),
    calculationMax: selected.max.toFixed(),
    displayMin: selected.min.div(selected.k).toDecimalPlaces(20).toFixed(),
    displayMax: selected.max.div(selected.k).toDecimalPlaces(20).toFixed(),
    status: calculation.lt(selected.min)
      ? StatusValue.LOW
      : calculation.gt(selected.max)
        ? StatusValue.HIGH
        : StatusValue.NORMAL,
  };
}
