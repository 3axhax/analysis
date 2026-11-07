import { normalizeToReference, NormalizationInput } from './reference-normalization';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

describe('method 45 reference units', () => {
  it.each([
    ['3.099', '0.000003099', StatusValue.LOW], ['3.1', '0.0000031', StatusValue.NORMAL],
    ['6.8', '0.0000068', StatusValue.NORMAL], ['6.801', '0.000006801', StatusValue.HIGH],
  ])('compares FT3 in pmol/L at %s', (sourceValue, convertedSource, status) => {
    const input: NormalizationInput = {
      pointId: 49, ageId: 1, genderId: 1, sourceUnitId: 99, sourceValue,
      allowedUnitIds: [4, 99],
      minimums: [{ pointId: 49, ageId: 1, genderId: 1, unitId: 99, value: '3.1' }],
      maximums: [{ pointId: 49, ageId: 1, genderId: 1, unitId: 99, value: '6.8' }],
      rules: [{ id: 1, pointId: 49, fromUnitId: 4, toUnitId: 99, coefficient: '1000000', version: 1, active: true }],
    };
    expect(normalizeToReference(input).status).toBe(status);
    expect(normalizeToReference({ ...input, sourceUnitId: 4, sourceValue: convertedSource }).status).toBe(status);
  });
  it.each([[1, 1], [1, 2], [2, 1], [2, 2]])('keeps urea mmol/L boundaries for age %i gender %i', (ageId, genderId) => {
    const input: NormalizationInput = {
      pointId: 28, ageId, genderId, sourceUnitId: 11, sourceValue: '2.3', allowedUnitIds: [11, 4],
      minimums: [{ pointId: 28, ageId, genderId, unitId: 11, value: '2.3' }],
      maximums: [{ pointId: 28, ageId, genderId, unitId: 11, value: '6.5' }],
      rules: [{ id: 2, pointId: null, fromUnitId: 4, toUnitId: 11, coefficient: '0.001', version: 1, active: true }],
    };
    for (const [value, status] of [['2.299', StatusValue.LOW], ['2.3', StatusValue.NORMAL], ['6.5', StatusValue.NORMAL], ['6.501', StatusValue.HIGH]]) {
      expect(normalizeToReference({ ...input, sourceValue: value }).status).toBe(status);
    }
  });
  it.each([[50, '10.8', '22', 99], [32, '0', '40', 12]])('compares exact bounds for point %i', (pointId, min, max, unitId) => {
    for (const genderId of [1, 2]) {
      const input: NormalizationInput = {
        pointId, ageId: 1, genderId, sourceUnitId: unitId, sourceValue: min,
        allowedUnitIds: [unitId],
        minimums: [{ pointId, ageId: 1, genderId, unitId, value: min }],
        maximums: [{ pointId, ageId: 1, genderId, unitId, value: max }],
        rules: [],
      };
      expect(normalizeToReference(input).status).toBe(StatusValue.NORMAL);
      expect(normalizeToReference({ ...input, sourceValue: max }).status).toBe(StatusValue.NORMAL);
      expect(normalizeToReference({ ...input, sourceValue: String(Number(max) + 0.01) }).status).toBe(StatusValue.HIGH);
    }
  });
});
