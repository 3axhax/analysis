import Decimal from 'decimal.js';

const D = Decimal.clone({ precision: 160 });

/** Values and interval limits are expressed in the same unit. */
export interface Interval {
  id: number;
  pointId: number;
  ageId: number;
  genderId: number;
  unitId: number;
  minValue: string | number | null;
  maxValue: string | number | null;
  minValueEqual: boolean | null;
  maxValueEqual: boolean | null;
}

export interface IntervalMeasurement {
  pointId: number;
  ageIds: readonly number[];
  genderId: number;
  unitId: number;
  value: string | number;
  fraction?: { numerator: string; denominator: string };
}

export interface IntervalCondition {
  id?: number;
  pointId: number;
  analysisPoint?: { id: number; name: string };
  intervalIds: readonly number[];
}

function number(value: string | number): Decimal {
  const raw = typeof value === 'number' ? String(value) : value;
  if (
    typeof raw !== 'string' ||
    raw.length > 100 ||
    !/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)(?:[eE][+-]?\d{1,3})?$/.test(raw)
  )
    throw new Error('invalid_interval_number');
  const result = new D(raw.replace(',', '.'));
  if (!result.isFinite()) throw new Error('invalid_interval_number');
  return result;
}

export function canonicalIntervalBound(
  value: string | number | null,
): string | null {
  return value === null ? null : number(value).toFixed();
}

/** Reject invalid or empty intervals rather than interpreting them implicitly. */
export function validateInterval(interval: Interval): void {
  const { minValue, maxValue, minValueEqual, maxValueEqual } = interval;
  if (minValue === null && maxValue === null)
    throw new Error('interval_without_bounds');
  if (
    (minValue === null) !== (minValueEqual === null) ||
    (maxValue === null) !== (maxValueEqual === null) ||
    (minValue !== null && typeof minValueEqual !== 'boolean') ||
    (maxValue !== null && typeof maxValueEqual !== 'boolean')
  )
    throw new Error('invalid_interval_boundary');
  const min = minValue === null ? null : number(minValue);
  const max = maxValue === null ? null : number(maxValue);
  if (
    [min, max].some(
      (bound) =>
        bound !== null &&
        (bound.sd() > 38 || bound.dp() > 18 || bound.abs().gte('1e20')),
    )
  )
    throw new Error('invalid_interval_precision');
  if (
    min &&
    max &&
    (min.gt(max) || (min.eq(max) && !(minValueEqual && maxValueEqual)))
  )
    throw new Error('empty_interval');
}

export function matchesInterval(
  interval: Interval,
  measurement: IntervalMeasurement,
): boolean {
  validateInterval(interval);
  if (
    interval.pointId !== measurement.pointId ||
    !measurement.ageIds.includes(interval.ageId) ||
    interval.genderId !== measurement.genderId ||
    interval.unitId !== measurement.unitId
  )
    return false;
  const numerator = number(
    measurement.fraction?.numerator ?? measurement.value,
  );
  const denominator = number(measurement.fraction?.denominator ?? 1);
  if (numerator.lt(0) || denominator.lte(0))
    throw new Error('invalid_interval_measurement');
  if (interval.minValue !== null) {
    const cmp = numerator.comparedTo(
      number(interval.minValue).times(denominator),
    );
    if (cmp < 0 || (cmp === 0 && !interval.minValueEqual)) return false;
  }
  if (interval.maxValue !== null) {
    const cmp = numerator.comparedTo(
      number(interval.maxValue).times(denominator),
    );
    if (cmp > 0 || (cmp === 0 && !interval.maxValueEqual)) return false;
  }
  return true;
}

/** Conditions combine with AND; linked intervals within one condition combine with OR. */
export function matchesConditions(
  conditions: readonly IntervalCondition[],
  matchedIntervals: readonly Pick<Interval, 'id' | 'pointId'>[],
): boolean {
  if (!conditions.length) return false;
  return conditions.every(
    (condition) =>
      condition.intervalIds.length > 0 &&
      matchedIntervals.some(
        (interval) =>
          interval.pointId === condition.pointId &&
          condition.intervalIds.includes(interval.id),
      ),
  );
}
