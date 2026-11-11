import { normalizeToReference, NormalizationInput } from './reference-normalization';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('CBC split age reference boundaries', () => {
  it.each([
    [70, 101, 1, '37', '60'], [17, 102, 7, '2', '8'], [70, 102, 1, '33', '55'],
    [15, 102, 7, '5.5', '14.5'], [18, 102, 7, '0.05', '0.8'],
    [15, 103, 7, '4.5', '11.5'], [18, 103, 7, '0.05', '0.4'], [71, 103, 1, '3', '9'],
    [10, 104, 2, '330', '340'],
  ])('checks point %i age %i for both sexes', (pointId, ageId, unitId, min, max) => {
    for (const genderId of [1,2]) {
      const key = { pointId, ageId, genderId, unitId };
      const input: NormalizationInput = { pointId, ageId, genderId, sourceUnitId:unitId, sourceValue:min, allowedUnitIds:[unitId], minimums:[{...key,value:min}], maximums:[{...key,value:max}], rules:[] };
      for (const [value,status] of [[Number(min)-0.001,S.LOW],[Number(min),S.NORMAL],[Number(max),S.NORMAL],[Number(max)+0.001,S.HIGH]] as const) {
        expect(normalizeToReference({...input,sourceValue:value.toFixed(3)}).status).toBe(status);
      }
    }
  });
});
