import { normalizeToReference } from './reference-normalization';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('protein fraction reference limits', () => {
  const cases: Array<[number, number, string, string]> = [[5,1,'2.9','4.9'],[58,1,'7.1','11.8'],[61,2,'6','13'],[76,1,'4.7','7.2']];
  it.each(cases)('checks point %i and both genders', (pointId, unitId, min, max) => {
    for (const genderId of [1,2]) {
      const key={ pointId, unitId, genderId, ageId:1 };
      const input={ ...key, sourceUnitId:unitId, sourceValue:min, allowedUnitIds:[unitId], minimums:[{...key,value:min}], maximums:[{...key,value:max}], rules:[] };
      for (const [value,status] of [[Number(min)-0.01,S.LOW],[Number(min),S.NORMAL],[Number(max),S.NORMAL],[Number(max)+0.01,S.HIGH]] as const) {
        expect(normalizeToReference({...input,sourceValue:value.toFixed(2)}).status).toBe(status);
      }
    }
  });
});
