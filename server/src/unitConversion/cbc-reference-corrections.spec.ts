import { normalizeToReference, NormalizationInput } from './reference-normalization';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';
import { AnalysisResultDescriptionService } from '../analysisResultDescription/analysisResultDescription.service';

describe('CBC reference correction', () => {
  const cases = [
    [1,3.9,5.9,3.9,5.9], [2,3.1,5.3,3.1,5.3], [3,2.7,4.5,2.7,4.5],
    [4,3.1,5.1,3.1,5.1], [5,3.9,5.5,3.9,5.5], [6,3.8,4.8,3.8,4.8],
    [7,3.7,4.9,3.7,4.9], [8,3.7,4.9,3.7,4.9], [9,3.8,4.9,3.8,4.9],
    [10,3.9,5.1,3.9,5.1], [11,3.9,5.1,3.9,5.1], [12,4.1,5.2,3.8,5.0],
    [13,4.2,5.6,3.9,5.1], [14,4.3,5.7,3.8,5.1],
  ];
  it.each(cases)('checks RBC boundaries for age %i and both sexes', (ageId, mLo, mHi, fLo, fHi) => {
    for (const [genderId, lo, hi] of [[1,mLo,mHi],[2,fLo,fHi]]) {
      const dimensions = { pointId: 2, ageId, genderId, unitId: 3 };
      const input: NormalizationInput = {
        pointId: 2, ageId, genderId, sourceUnitId: 3, sourceValue: String(lo), allowedUnitIds: [3],
        minimums: [{ ...dimensions, value: String(lo) }], maximums: [{ ...dimensions, value: String(hi) }], rules: [],
      };
      for (const [value, status] of [[lo-0.01,S.LOW],[lo,S.NORMAL],[hi,S.NORMAL],[hi+0.01,S.HIGH]] as const) {
        expect(normalizeToReference({ ...input, sourceValue: value.toFixed(2) }).status).toBe(status);
      }
    }
  });
});

describe('CBC description matching', () => {
  const model = (id: number, conditions: Record<number, S>) => ({
    get: () => ({ id, sourceId: null, analysisResultDescriptionConditions: Object.entries(conditions).map(([pointId,status]) => ({ pointId: Number(pointId), status })) }),
  });
  const repo = { findAll: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, {} as never);
  it('requires raised transferrin and TIBC and low MCHC in the eight-condition example', async () => {
    const condition = { 1:S.LOW, 22:S.LOW, 24:S.LOW, 8:S.LOW, 9:S.LOW, 10:S.LOW, 23:S.HIGH, 25:S.HIGH };
    repo.findAll.mockResolvedValue([model(59,condition)]);
    expect(await service.getDescriptionsByConditions(condition)).toHaveLength(1);
    expect(await service.getDescriptionsByConditions({ ...condition, 23:S.LOW, 25:S.LOW })).toHaveLength(0);
    const { 10: _missing, ...missing } = condition;
    expect(await service.getDescriptionsByConditions(missing)).toHaveLength(0);
  });
  it('requires normal hemoglobin for the specified B12/folate example', async () => {
    const condition = { 1:S.NORMAL, 2:S.LOW, 8:S.HIGH, 9:S.HIGH };
    repo.findAll.mockResolvedValue([model(44,condition)]);
    expect(await service.getDescriptionsByConditions(condition)).toHaveLength(1);
    expect(await service.getDescriptionsByConditions({ ...condition, 1:S.LOW })).toHaveLength(0);
    const { 1: _missing, ...missing } = condition;
    expect(await service.getDescriptionsByConditions(missing)).toHaveLength(0);
  });
});
