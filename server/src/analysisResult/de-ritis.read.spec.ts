import { IntervalResultReadService } from '../interval/interval-result-read.service';

describe('derived de Ritis interval result', () => {
  function setup(alt = '20', ast = '30') {
    const rows = [32, 33].map((pointId) => ({ id: pointId, pointId, unitId: 12, sourceUnitId: 12, sourceValue: pointId === 32 ? alt : ast, value: Number(pointId === 32 ? alt : ast), point: { id: pointId, name: pointId === 32 ? 'alanine_aminotransferase' : 'aspartate_aminotransferase' } }));
    const original = { ageId: 1, genderId: 1, analysisResultPointData: rows };
    const evaluator = { evaluate: jest.fn().mockResolvedValue({ points: [], descriptions: [], sourceDescriptions: [], warnings: [], references: [], displayReferences: [] }) };
    const args = [
      { findOne: jest.fn().mockResolvedValue({ get: () => structuredClone(original) }) },
      { getAnalysisPointByName: jest.fn().mockResolvedValue({ id: 99, name: 'de_ritis_ratio' }) },
      { getAll: jest.fn().mockResolvedValue([{ id: 12, name: 'unit/l' }, { id: 20, name: 'без ед.' }]) },
      { sourceCatalog: jest.fn().mockResolvedValue([]) }, evaluator, { query: jest.fn().mockResolvedValue([]) },
    ] as unknown as ConstructorParameters<typeof IntervalResultReadService>;
    return { service: new IntervalResultReadService(...args), evaluator, original };
  }
  it('passes the exact ratio to interval evaluation without mutating the saved input', async () => {
    const s = setup(); const before = structuredClone(s.original);
    const result = await s.service.read('synthetic');
    expect(result.result?.analysisResultPointData).toHaveLength(3);
    expect(result.result?.analysisResultPointData[2]).toMatchObject({ pointId: 99, displayValue: '1.5', isCalculated: true });
    expect(s.evaluator.evaluate).toHaveBeenCalledWith(expect.objectContaining({ measurements: expect.arrayContaining([expect.objectContaining({ pointId: 99, fraction: { numerator: '30', denominator: '20' } })]) }));
    expect(s.original).toEqual(before);
  });
  it('does not add the derived point when ALT is zero', async () => {
    const s = setup('0', '30');
    const result = await s.service.read('synthetic');
    expect(result.result?.analysisResultPointData).toHaveLength(2);
    expect(s.evaluator.evaluate.mock.calls[0][0].measurements).toHaveLength(2);
  });
});
