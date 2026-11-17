import {
  UnitConversionRule,
  UnitNormalizationError,
} from '../unitConversion/reference-normalization';
import {
  Interval,
  IntervalCondition,
  IntervalMeasurement,
  matchesConditions,
} from './interval-matcher';
import { matchConvertedIntervals } from './interval-conversion';

export type IntervalStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'OPTIMUM';
export interface SourcedInterval extends Interval {
  sourceId: number | null;
  status: IntervalStatus | null;
}
export interface IntervalDescription {
  id: number;
  sourceId: number | null;
  conditions: IntervalCondition[];
}
export interface IntervalInput {
  measurement: IntervalMeasurement;
  allowedUnitIds: number[];
  rules: UnitConversionRule[];
}

/** Source selection is intentionally absent: it filters descriptions after evaluation. */
export function evaluateIntervals(
  inputs: readonly IntervalInput[],
  intervals: readonly SourcedInterval[],
  descriptions: readonly IntervalDescription[],
) {
  const matched = new Map<number, SourcedInterval>();
  const warnings: { pointId: number; intervalId: number; code: string }[] = [];
  for (const input of inputs) {
    for (const interval of intervals) {
      if (
        interval.pointId !== input.measurement.pointId ||
        interval.ageId !== input.measurement.ageId ||
        interval.genderId !== input.measurement.genderId
      )
        continue;
      try {
        if (
          matchConvertedIntervals(
            input.measurement,
            [interval],
            input.allowedUnitIds,
            input.rules,
          ).length
        )
          matched.set(interval.id, interval);
      } catch (error) {
        if (!(error instanceof UnitNormalizationError)) throw error;
        warnings.push({
          pointId: interval.pointId,
          intervalId: interval.id,
          code: error.code,
        });
      }
    }
  }
  const matchingIntervals = [...matched.values()];
  return {
    intervals: matchingIntervals,
    descriptions: descriptions.filter((description) =>
      matchesConditions(description.conditions, matchingIntervals),
    ),
    warnings,
  };
}
