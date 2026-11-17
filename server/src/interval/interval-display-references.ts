import Decimal from 'decimal.js';
import { sourceMeasurementValue } from '../unitConversion/reference-normalization';
import { IntervalInput, SourcedInterval } from './interval-evaluator';

const D = Decimal.clone({ precision: 80 });
export type DisplayReference = SourcedInterval & {
  minApproximate?: boolean;
  maxApproximate?: boolean;
};

/** Choose exact units first for each document and status; otherwise convert unambiguously. */
export function displayReferences(
  input: IntervalInput,
  intervals: readonly SourcedInterval[],
): DisplayReference[] {
  const m = input.measurement;
  if (!input.allowedUnitIds.includes(m.unitId)) return [];
  const candidates = intervals.filter(
    (i) =>
      i.pointId === m.pointId &&
      i.ageId === m.ageId &&
      i.genderId === m.genderId &&
      (i.status === 'NORMAL' || i.status === 'OPTIMUM') &&
      input.allowedUnitIds.includes(i.unitId),
  );
  const exactGroups = new Set(
    candidates
      .filter((i) => i.unitId === m.unitId)
      .map((i) => `${i.sourceId ?? 'common'}:${i.status}`),
  );
  const converted: DisplayReference[] = candidates.flatMap((interval) => {
    if (interval.unitId === m.unitId) return [{ ...interval }];
    if (exactGroups.has(`${interval.sourceId ?? 'common'}:${interval.status}`))
      return [];
    const rules = input.rules.filter(
      (r) =>
        r.active &&
        r.fromUnitId === m.unitId &&
        r.toUnitId === interval.unitId &&
        (r.pointId === null || r.pointId === m.pointId),
    );
    if (
      rules.length !== 1 ||
      !Number.isSafeInteger(rules[0].id) ||
      rules[0].id <= 0 ||
      !Number.isSafeInteger(rules[0].version) ||
      rules[0].version <= 0
    )
      return [];
    try {
      const k = new D(sourceMeasurementValue(rules[0].coefficient));
      if (k.lte(0)) return [];
      const convert = (value: string | number | null) => {
        if (value === null) return { value: null, approximate: false };
        const original = new D(value);
        const converted = original.div(k).toDecimalPlaces(20);
        return {
          value: converted.toFixed(),
          approximate: !converted.times(k).eq(original),
        };
      };
      const min = convert(interval.minValue);
      const max = convert(interval.maxValue);
      return [
        {
          ...interval,
          unitId: m.unitId,
          minValue: min.value,
          maxValue: max.value,
          minApproximate: min.approximate,
          maxApproximate: max.approximate,
        },
      ];
    } catch {
      return [];
    }
  });
  const seen = new Set<string>();
  return converted.filter((interval) => {
    const key = JSON.stringify([
      interval.sourceId,
      interval.status,
      interval.minApproximate || interval.maxApproximate ? interval.id : null,
      interval.minValue === null ? null : new D(interval.minValue).toFixed(),
      interval.minValueEqual,
      interval.maxValue === null ? null : new D(interval.maxValue).toFixed(),
      interval.maxValueEqual,
    ]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
