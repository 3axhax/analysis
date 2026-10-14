import { AnalysisResultService } from './analysisResult.service';

describe('saving finite nonnegative results', () => {
  const setup = (knownPoint = true, knownUnit = true) => {
    const savePointData = jest.fn().mockResolvedValue(undefined);
    const args = [
      { create: jest.fn().mockResolvedValue({ id: 1, resultId: 'synthetic' }) },
      { getAgeByDays: jest.fn().mockResolvedValue({ id: 1 }) },
      { getGenderByName: jest.fn().mockResolvedValue({ id: 1 }) },
      {
        getAnalysisPointByName: jest
          .fn()
          .mockResolvedValue(knownPoint ? { id: 2 } : null),
      },
      {
        getAnalysisPointUnitsByName: jest
          .fn()
          .mockResolvedValue(knownUnit ? { id: 3 } : null),
      },
      { savePointData },
      {},
      {},
      {},
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    return { service: new AnalysisResultService(...args), savePointData };
  };
  it.each([0, 0.5, 1, 3000])(
    'saves the finite value %s without changing the save upper bound',
    async (value) => {
      const { service, savePointData } = setup();
      await service.saveResult({
        ageInDays: 1,
        gender: 'synthetic',
        user: undefined,
        pointData: [{ name: 'synthetic', units: 'synthetic', value }],
      });
      expect(savePointData).toHaveBeenCalledWith({
        resultId: 1,
        pointId: 2,
        unitId: 3,
        value,
      });
    },
  );
  it.each([-1, NaN, Infinity, -Infinity, '0', null, undefined])(
    'does not save invalid input %s',
    async (value) => {
      const { service, savePointData } = setup();
      await service.saveResult({
        ageInDays: 1,
        gender: 'synthetic',
        user: undefined,
        pointData: [
          { name: 'synthetic', units: 'synthetic', value: value as number },
        ],
      });
      expect(savePointData).not.toHaveBeenCalled();
    },
  );
  it.each([
    [false, true],
    [true, false],
  ])('does not save unknown point/unit', async (point, unit) => {
    const { service, savePointData } = setup(point, unit);
    await service.saveResult({
      ageInDays: 1,
      gender: 'synthetic',
      user: undefined,
      pointData: [{ name: 'synthetic', units: 'synthetic', value: 0 }],
    });
    expect(savePointData).not.toHaveBeenCalled();
  });
});
