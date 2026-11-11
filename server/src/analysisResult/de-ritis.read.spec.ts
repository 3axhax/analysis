import { AnalysisResultService } from './analysisResult.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('derived de Ritis result', () => {
  function setup(alt = '20', ast = '30') {
    const points = [32, 33].map((pointId) => ({ pointId, unitId: 12, sourceUnitId: 12, sourceValue: pointId === 32 ? alt : ast, value: 0, point: { id: pointId, name: pointId === 32 ? 'alanine_aminotransferase' : 'aspartate_aminotransferase' }, pointUnit: { id: 12, name: 'unit/l' } }));
    const original = { ageId: 1, genderId: 1, analysisResultPointData: points };
    const getDescriptionsByConditions = jest.fn().mockResolvedValue([]);
    const normalize = jest.fn(async ({ pointId, sourceValue, sourceUnitId }) => ({ sourceValue: String(sourceValue), sourceUnitId, status: S.NORMAL, displayMin: pointId === 99 ? '0.91' : '0', displayMax: pointId === 99 ? '1.75' : '40', calculationValue: String(sourceValue), calculationUnitId: sourceUnitId, appliedCoefficient: '1', conversionRuleId: null, conversionRuleVersion: null, calculationMin: '0', calculationMax: '40' }));
    const args = [
      { findOne: jest.fn().mockResolvedValue({ resultId: 'synthetic', get: () => structuredClone(original) }) }, {}, {},
      { getAnalysisPointByName: jest.fn().mockResolvedValue({ id: 99, name: 'de_ritis_ratio', translationRu: 'Коэффициент де Ритиса' }) },
      { getAll: jest.fn().mockResolvedValue([{ id: 12, name: 'unit/l' }, { id: 20, name: 'без ед.' }]) }, {},
      { getDescriptionsByConditions }, { normalize, sourceCatalog: jest.fn().mockResolvedValue([]) },
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    return { service: new AnalysisResultService(...args), getDescriptionsByConditions, original };
  }
  it('adds the calculated point and uses its status in description conditions without mutating the saved input', async () => {
    const s = setup(); const before = structuredClone(s.original);
    const output = await s.service.getResultByResultId({ resultId: 'synthetic' });
    expect(output.result?.analysisResultPointData).toHaveLength(3);
    expect(output.result?.analysisResultPointData[2]).toMatchObject({ pointId: 99, value: 1.5, pointDataStatus: S.NORMAL, minValue: 0.91, maxValue: 1.75, isCalculated: true });
    expect(s.getDescriptionsByConditions).toHaveBeenCalledWith(expect.objectContaining({ 99: S.NORMAL }), null, expect.objectContaining({ pointId: 99, status: S.NORMAL }));
    expect(s.original).toEqual(before);
  });
  it.each([['100','91',S.NORMAL],['100','90.99',S.LOW],['100','175',S.NORMAL],['100','175.01',S.HIGH],['20','0',S.LOW]])('classifies AST %s / ALT %s accurately', async (alt, ast, expected) => {
    const s = setup(alt, ast);
    const output = await s.service.getResultByResultId({ resultId: 'synthetic' });
    expect(output.result?.analysisResultPointData[2].pointDataStatus).toBe(expected);
    expect(s.getDescriptionsByConditions).toHaveBeenCalledWith(expect.objectContaining({ 99: expected }), null, expect.objectContaining({ pointId: 99, status: expected }));
  });
  it('does not display a rounded boundary when the exact value is above it', async () => {
    const s = setup('100000000000000000', '175000000000000001');
    const output = await s.service.getResultByResultId({ resultId: 'synthetic' });
    expect(output.result?.analysisResultPointData[2]).toMatchObject({ pointDataStatus: S.HIGH, displayValue: '1.75000000000000001' });
  });
  it('does not add a point or condition when ALT is zero', async () => {
    const s = setup('0', '30');
    const output = await s.service.getResultByResultId({ resultId: 'synthetic' });
    expect(output.result?.analysisResultPointData).toHaveLength(2);
    expect(s.getDescriptionsByConditions.mock.calls[0][0]).not.toHaveProperty('99');
  });
});
