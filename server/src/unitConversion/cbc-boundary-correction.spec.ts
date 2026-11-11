import { normalizeToReference, NormalizationInput } from './reference-normalization';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

describe('corrected CBC reference boundaries', () => {
  const examples: Array<[number, number, number, number, string, string]> = [
    [3, 6, 1, 1, '32', '40'], [3, 6, 2, 1, '32', '40'],
    [3, 14, 2, 1, '35', '45'], [9, 14, 1, 6, '27', '34'],
    ...[6,7,8,9,10,11,12,13,14].flatMap((age): Array<[number,number,number,number,string,string]> => [
      [11,age,1,1,'11','14.8'], [11,age,2,1,'11','14.8'],
    ]),
  ];
  it.each(examples)('checks point %i age %i gender %i', (pointId, ageId, genderId, unitId, min, max) => {
    const key = { pointId, ageId, genderId, unitId };
    const input: NormalizationInput = {
      pointId, ageId, genderId, sourceUnitId: unitId, sourceValue: min, allowedUnitIds: [unitId],
      minimums: [{ ...key, value: min }], maximums: [{ ...key, value: max }], rules: [],
    };
    for (const [value, status] of [[Number(min)-0.01,StatusValue.LOW],[Number(min),StatusValue.NORMAL],[Number(max),StatusValue.NORMAL],[Number(max)+0.01,StatusValue.HIGH]] as const) {
      expect(normalizeToReference({ ...input, sourceValue: value.toFixed(2) }).status).toBe(status);
    }
  });
});
