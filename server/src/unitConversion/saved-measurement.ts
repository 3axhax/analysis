import Decimal from 'decimal.js';
import {
  normalizeToReference,
  UnitNormalizationError,
} from './reference-normalization';

export interface SavedMeasurement {
  pointId: number;
  unitId: number;
  sourceUnitId: number | null;
  sourceValue: string | null;
  calculationValue: string | null;
  conversionRuleId: number | null;
  conversionRuleVersion: number | null;
  appliedCoefficient: string | null;
  referenceMin: string | null;
  referenceMax: string | null;
}

/** Source-only rows have no persisted clinical interpretation at all. */
export function isSourceOnlyMeasurement(saved: SavedMeasurement): boolean {
  return (
    saved.sourceValue !== null &&
    saved.sourceValue !== undefined &&
    saved.sourceUnitId !== null &&
    saved.sourceUnitId === saved.unitId &&
    saved.calculationValue === null &&
    saved.appliedCoefficient === null &&
    saved.conversionRuleId === null &&
    saved.conversionRuleVersion === null &&
    saved.referenceMin === null &&
    saved.referenceMax === null
  );
}
/** Uses stored provenance, never current conversion rules, for a saved calculation. */
export function projectSavedMeasurement(
  saved: SavedMeasurement,
  ageId: number,
  genderId: number,
) {
  if (
    saved.sourceUnitId === null ||
    saved.sourceValue === null ||
    saved.calculationValue === null ||
    saved.appliedCoefficient === null ||
    saved.referenceMin === null ||
    saved.referenceMax === null
  )
    throw new UnitNormalizationError('incomplete_saved_provenance');
  const context = {
    pointId: saved.pointId,
    ageId,
    genderId,
    unitId: saved.unitId,
  };
  const normalized = normalizeToReference({
    ...context,
    sourceUnitId: saved.sourceUnitId,
    sourceValue: saved.sourceValue,
    allowedUnitIds: [saved.sourceUnitId, saved.unitId],
    minimums: [{ ...context, value: saved.referenceMin }],
    maximums: [{ ...context, value: saved.referenceMax }],
    rules:
      saved.conversionRuleId === null
        ? []
        : [
            {
              id: saved.conversionRuleId,
              fromUnitId: saved.sourceUnitId,
              toUnitId: saved.unitId,
              coefficient: saved.appliedCoefficient,
              version: saved.conversionRuleVersion ?? 0,
              active: true,
              pointId: saved.pointId,
            },
          ],
  });
  if (!new Decimal(normalized.calculationValue).eq(saved.calculationValue))
    throw new UnitNormalizationError('saved_calculation_mismatch');
  return normalized;
}
