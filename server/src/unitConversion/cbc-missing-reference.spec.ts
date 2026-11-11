import { normalizeToReference, NormalizationInput } from './reference-normalization';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

describe('CBC missing references', () => {
  it.each([
    [10, 10, 2, '280', '360', '279.99', '360.01'],
    [18, 14, 7, '0.05', '0.82', '0.049', '0.821'],
    [70, 2, 1, '46', '65', '45.99', '65.01'],
  ])('compares point %i at its boundaries for both sexes', (pointId, ageId, unitId, min, max, below, above) => {
    for (const genderId of [1, 2]) {
      const input: NormalizationInput = {
        pointId, ageId, genderId, sourceUnitId: unitId, sourceValue: min,
        allowedUnitIds: [unitId],
        minimums: [{ pointId, ageId, genderId, unitId, value: min }],
        maximums: [{ pointId, ageId, genderId, unitId, value: max }],
        rules: [],
      };
      for (const [value, status] of [[below, StatusValue.LOW], [min, StatusValue.NORMAL], [max, StatusValue.NORMAL], [above, StatusValue.HIGH]]) {
        expect(normalizeToReference({ ...input, sourceValue: value }).status).toBe(status);
      }
    }
  });
});
