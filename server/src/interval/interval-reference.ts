import {
  normalizeToReference,
  UnitNormalizationError,
} from '../unitConversion/reference-normalization';
import { canonicalIntervalBound } from './interval-matcher';
import { IntervalInput, SourcedInterval } from './interval-evaluator';

/** The result table shows the common reference, regardless of the matched interval. */
export function commonReference(
  input: IntervalInput,
  intervals: readonly SourcedInterval[],
) {
  const { measurement } = input;
  const ageId = measurement.ageIds[0];
  if (ageId === undefined) return null;
  const candidates = intervals.filter(
    (interval) =>
      measurement.ageIds.includes(interval.ageId) &&
      interval.pointId === measurement.pointId &&
      interval.genderId === measurement.genderId &&
      interval.sourceId === null &&
      interval.status === 'NORMAL' &&
      interval.minValue !== null &&
      interval.maxValue !== null,
  );
  try {
    const references = [...new Map(candidates.map((row) => [
      JSON.stringify([row.unitId, canonicalIntervalBound(row.minValue),
        canonicalIntervalBound(row.maxValue), row.minValueEqual, row.maxValueEqual]),
      { ...row, ageId },
    ])).values()];
    return normalizeToReference({
      pointId: input.measurement.pointId,
      ageId,
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
