import Decimal from 'decimal.js';
import {
  UnitConversionRule,
  UnitNormalizationError,
  sourceMeasurementValue,
} from '../unitConversion/reference-normalization';
import {
  Interval,
  IntervalMeasurement,
  matchesInterval,
} from './interval-matcher';

const D = Decimal.clone({ precision: 160 });

/** Match every applicable interval independently, including converted units. */
export function matchConvertedIntervals(
  measurement: IntervalMeasurement,
  intervals: readonly Interval[],
  allowedUnitIds: readonly number[],
  rules: readonly UnitConversionRule[],
): Interval[] {
  if (!allowedUnitIds.includes(measurement.unitId))
    throw new UnitNormalizationError('source_unit_not_allowed');
  const source = measurement.fraction
    ? new D(measurement.fraction.numerator)
    : new D(sourceMeasurementValue(measurement.value));
  const denominator = measurement.fraction
    ? new D(measurement.fraction.denominator)
    : new D(1);
  if (
    !source.isFinite() ||
    source.lt(0) ||
    !denominator.isFinite() ||
    denominator.lte(0)
  )
    throw new UnitNormalizationError('invalid_source_value');
  return intervals.filter((interval) => {
    if (
      interval.pointId !== measurement.pointId ||
      !measurement.ageIds.includes(interval.ageId) ||
      interval.genderId !== measurement.genderId ||
      !allowedUnitIds.includes(interval.unitId)
    )
      return false;
    let value = source;
    if (interval.unitId !== measurement.unitId) {
      const candidates = rules.filter(
        (rule) =>
          rule.active &&
          rule.fromUnitId === measurement.unitId &&
          rule.toUnitId === interval.unitId &&
          (rule.pointId === null || rule.pointId === measurement.pointId),
      );
      if (!candidates.length) return false;
      if (candidates.length !== 1)
        throw new UnitNormalizationError('ambiguous_conversion_rule');
      const rule = candidates[0];
      if (
        !Number.isSafeInteger(rule.id) ||
        rule.id <= 0 ||
        !Number.isSafeInteger(rule.version) ||
        rule.version <= 0
      )
        throw new UnitNormalizationError('invalid_conversion_rule');
      let coefficient: Decimal;
      try {
        coefficient = new D(sourceMeasurementValue(rule.coefficient));
      } catch (error) {
        if (error instanceof UnitNormalizationError)
          throw new UnitNormalizationError('invalid_conversion_coefficient');
        throw error;
      }
      if (coefficient.lte(0))
        throw new UnitNormalizationError('invalid_conversion_coefficient');
      value = source.times(coefficient);
      if (!value.isFinite() || value.abs().gte(denominator.times('1e40')))
        throw new UnitNormalizationError('conversion_overflow');
    }
    return matchesInterval(interval, {
      ...measurement,
      unitId: interval.unitId,
      value: value.toFixed(),
      fraction: {
        numerator: value.toFixed(),
        denominator: denominator.toFixed(),
      },
    });
  });
}
