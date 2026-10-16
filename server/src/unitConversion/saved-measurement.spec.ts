import {
  projectSavedMeasurement,
  SavedMeasurement,
  isSourceOnlyMeasurement,
} from './saved-measurement';
describe('historical conversion provenance', () => {
  const saved: SavedMeasurement = {
    pointId: 1,
    unitId: 2,
    sourceUnitId: 16,
    sourceValue: '12',
    calculationValue: '120',
    conversionRuleId: 1,
    conversionRuleVersion: 1,
    appliedCoefficient: '10',
    referenceMin: '100',
    referenceMax: '160',
  };
  it('uses saved coefficient and range without reading new rules or current norms', () => {
    const result = projectSavedMeasurement(saved, 1, 1);
    expect(result.sourceValue).toBe('12');
    expect(result.calculationValue).toBe('120');
    expect(result.displayMin).toBe('10');
    expect(result.conversionRuleVersion).toBe(1);
  });
  it('rejects damaged provenance rather than silently recalculating from current catalog', () => {
    expect(() =>
      projectSavedMeasurement({ ...saved, calculationValue: '121' }, 1, 1),
    ).toThrow('saved_calculation_mismatch');
    expect(() =>
      projectSavedMeasurement({ ...saved, sourceValue: null }, 1, 1),
    ).toThrow('incomplete_saved_provenance');
  });
  it('distinguishes source-only rows from damaged historical calculations', () => {
    const source: SavedMeasurement = {
      ...saved,
      unitId: 16,
      calculationValue: null,
      appliedCoefficient: null,
      conversionRuleId: null,
      conversionRuleVersion: null,
      referenceMin: null,
      referenceMax: null,
    };
    expect(isSourceOnlyMeasurement(source)).toBe(true);
    expect(isSourceOnlyMeasurement(saved)).toBe(false);
    expect(isSourceOnlyMeasurement({ ...source, referenceMin: '1' })).toBe(
      false,
    );
    expect(isSourceOnlyMeasurement({ ...source, unitId: 2 })).toBe(false);
  });
});
