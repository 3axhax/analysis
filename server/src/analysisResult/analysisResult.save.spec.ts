import { AnalysisResultService } from './analysisResult.service';
describe('atomic source-only result saving', () => {
  const setup = () => {
    const transaction = { id: 'synthetic-transaction' };
    const create = jest
      .fn()
      .mockResolvedValue({ id: 1, resultId: 'synthetic' });
    const savePointData = jest.fn().mockResolvedValue({});
    const normalize = jest
      .fn()
      .mockRejectedValue(new Error('No reference lookup during save'));
    const db = {
      transaction: jest.fn(
        async (
          _: unknown,
          callback: (tx: typeof transaction) => Promise<unknown>,
        ) => await callback(transaction),
      ),
    };
    const units = [
      { id: 2, name: 'g/l', translationParsing: 'г/л', code: 'g/L' },
      { id: 16, name: 'g/dl', translationParsing: 'г/дл', code: 'g/dL' },
    ];
    const args = [
      { create, sequelize: db },
      { getAgeByDays: jest.fn().mockResolvedValue({ id: 1 }) },
      { getGenderByName: jest.fn().mockResolvedValue({ id: 1 }) },
      {
        getAnalysisPointByName: jest.fn((name: string) =>
          Promise.resolve(
            name === 'synthetic'
              ? { id: 1 }
              : name === 'without-reference'
                ? { id: 2 }
                : null,
          ),
        ),
      },
      { getAll: jest.fn().mockResolvedValue(units) },
      { savePointData },
      { getDescriptionsByConditions: jest.fn().mockResolvedValue([]) },
      { normalize },
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    return {
      service: new AnalysisResultService(...args),
      create,
      savePointData,
      normalize,
      transaction,
    };
  };
  const input = (value: number | string = 12, units = 'g/dl') => ({
    ageInDays: 1,
    gender: 'synthetic',
    user: undefined,
    pointData: [{ name: 'synthetic', units, value, sourceUnitText: 'г/дл' }],
  });
  it('persists only source fields atomically, ignoring client calculations and norms', async () => {
    const s = setup();
    await s.service.saveResult({
      ...input(),
      pointData: [
        { ...input().pointData[0], coefficient: 99, calculationValue: 999 },
      ],
    } as never);
    expect(s.create).toHaveBeenCalledWith(expect.anything(), {
      transaction: s.transaction,
    });
    expect(s.savePointData).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 12,
        unitId: 16,
        sourceValue: '12',
        sourceUnitId: 16,
        sourceUnitText: 'г/дл',
        calculationValue: null,
        conversionRuleId: null,
        conversionRuleVersion: null,
        appliedCoefficient: null,
        referenceMin: null,
        referenceMax: null,
      }),
      s.transaction,
    );
    expect(s.normalize).not.toHaveBeenCalled();
  });
  it.each([0, 0.5, 1, 3000])(
    'saves finite value %s including zero',
    async (value) => {
      const s = setup();
      await s.service.saveResult(input(value, 'g/l'));
      expect(s.savePointData).toHaveBeenCalledWith(
        expect.objectContaining({
          value,
          sourceUnitId: 2,
          appliedCoefficient: null,
        }),
        s.transaction,
      );
    },
  );
  it('saves every parameter even if normative lookup would fail', async () => {
    const s = setup();
    await s.service.saveResult({
      ...input(),
      pointData: [
        ...input().pointData,
        { name: 'without-reference', units: 'g/l', value: 0 },
      ],
    });
    expect(s.savePointData).toHaveBeenCalledTimes(2);
    expect(s.savePointData).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        pointId: 2,
        sourceValue: '0',
        sourceUnitId: 2,
        referenceMin: null,
      }),
      s.transaction,
    );
    expect(s.normalize).not.toHaveBeenCalled();
  });
  it('keeps exact decimal source independent of the float compatibility column', async () => {
    const s = setup();
    await s.service.saveResult(input('123.123456789123456789'));
    expect(s.savePointData).toHaveBeenCalledWith(
      expect.objectContaining({ sourceValue: '123.123456789123456789' }),
      s.transaction,
    );
  });
  it.each([-1, NaN, Infinity, -Infinity, null, undefined])(
    'rejects invalid value %s before any parent/child write',
    async (value) => {
      const s = setup();
      await expect(
        s.service.saveResult({
          ...input(),
          pointData: [{ ...input().pointData[0], value: value as number }],
        }),
      ).rejects.toThrow();
      expect(s.create).not.toHaveBeenCalled();
      expect(s.savePointData).not.toHaveBeenCalled();
    },
  );
  it('validates all items before writing and rejects duplicate identities', async () => {
    const s = setup();
    await expect(
      s.service.saveResult({
        ...input(),
        pointData: [
          ...input().pointData,
          { name: 'unknown', units: 'g/l', value: 1 },
        ],
      }),
    ).rejects.toThrow('unknown_point_or_unit');
    expect(s.create).not.toHaveBeenCalled();
    await expect(
      s.service.saveResult({
        ...input(),
        pointData: [...input().pointData, ...input().pointData],
      }),
    ).rejects.toThrow('duplicate_point');
    expect(s.create).not.toHaveBeenCalled();
  });
  it('sanitizes storage failure rather than returning success or leaking SQL', async () => {
    const s = setup();
    s.savePointData.mockRejectedValue(new Error('PRIVATE_SQL_PAYLOAD'));
    await expect(s.service.saveResult(input())).rejects.toThrow(
      'result_save_failed',
    );
  });
  it('does not display an unrelated supplied unit label and rejects empty input', async () => {
    const s = setup();
    await s.service.saveResult({
      ...input(),
      pointData: [{ ...input().pointData[0], sourceUnitText: 'wrong-unit' }],
    });
    expect(s.savePointData).toHaveBeenCalledWith(
      expect.objectContaining({ sourceUnitText: 'g/dl' }),
      s.transaction,
    );
    await expect(
      s.service.saveResult({ ...input(), pointData: [] }),
    ).rejects.toThrow('invalid_result_input');
  });
});
