import {
  normalizeToReference,
  UnitNormalizationError,
} from '../unitConversion/reference-normalization';
import { IntervalInput, SourcedInterval } from './interval-evaluator';

/** The result table shows the common reference, regardless of the matched interval. */
export function commonReference(
  input: IntervalInput,
  intervals: readonly SourcedInterval[],
) {
  const references = intervals.filter(
    (interval) =>
      interval.sourceId === null &&
      interval.status === 'NORMAL' &&
      interval.minValue !== null &&
      interval.maxValue !== null,
  );
  try {
    return normalizeToReference({
      pointId: input.measurement.pointId,
      ageId: input.measurement.ageId,
      genderId: input.measurement.genderId,
      sourceUnitId: input.measurement.unitId,
      sourceValue: input.measurement.value,
      allowedUnitIds: input.allowedUnitIds,
      rules: input.rules,
      minimums: references.map((row) => ({ ...row, value: row.minValue! })),
      maximums: references.map((row) => ({ ...row, value: row.maxValue! })),
    });
  } catch (error) {
    if (error instanceof UnitNormalizationError) return null;
    throw error;
  }
}
