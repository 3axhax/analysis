import { normalizeToReference, NormalizationInput } from './reference-normalization';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('CBC reference cleanup', () => {
  const cases: Array<[number,number,number,number[]]> = [
    [17, 201, 1, [1,7]], [70, 201, 1, [1]], [16, 202, 7, [7]],
    [69, 202, 1, [1]], [11, 203, 1, [1]],
  ];
  it.each(cases)('does not invent a missing reference for point %i', (pointId,ageId,unitId,allowedUnitIds) => {
    for (const genderId of [1,2]) {
      const abs = { pointId, ageId, genderId, unitId: 7 };
      const input: NormalizationInput = {
        pointId, ageId, genderId, sourceUnitId:unitId, sourceValue:'4', allowedUnitIds,
        minimums:pointId===17 ? [{...abs,value:'2'}] : [],
        maximums:pointId===17 ? [{...abs,value:'8'}] : [], rules:[],
      };
      expect(() => normalizeToReference(input)).toThrow('no_convertible_reference_range');
    }
  });
  it.each([1,2])('preserves the absolute lymphocyte reference for sex %i', (genderId) => {
    const key = { pointId:17, ageId:201, genderId, unitId:7 };
    const input: NormalizationInput = {
      ...key, sourceUnitId:7, sourceValue:'4', allowedUnitIds:[1,7],
      minimums:[{...key,value:'2'}], maximums:[{...key,value:'8'}], rules:[],
    };
    expect(normalizeToReference(input).status).toBe(S.NORMAL);
  });
  it.each([1,2])('preserves the neighboring RDW reference for sex %i', (genderId) => {
    const key = { pointId:11, ageId:204, genderId, unitId:1 };
    const input: NormalizationInput = {
      ...key, sourceUnitId:1, sourceValue:'15', allowedUnitIds:[1],
      minimums:[{...key,value:'14.9'}], maximums:[{...key,value:'18.7'}], rules:[],
    };
    expect(normalizeToReference(input).status).toBe(S.NORMAL);
  });
});
