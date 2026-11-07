import { UnitConversionService } from './unit-conversion.service';
import { UnitNormalizationError } from './reference-normalization';

describe('source reference lookup', () => {
  const input = {
    pointId: 1,
    ageId: 2,
    genderId: 1,
    sourceUnitId: 3,
    sourceValue: '3',
  };
  function setup(hasOwn: boolean, inherits: boolean) {
    const db = {
      query: jest.fn(async (query: string) => {
        if (query.startsWith('SELECT EXISTS')) return [{ present: hasOwn }];
        if (query.includes('sourceReferenceInheritance'))
          return [{ count: inherits ? '1' : '0' }];
        if (query.includes('analysisPointMinValue'))
          return [{ pointId: 1, ageId: 2, genderId: 1, unitId: 3, value: '4' }];
        if (query.includes('analysisPointMaxValue'))
          return [{ pointId: 1, ageId: 2, genderId: 1, unitId: 3, value: '6' }];
        if (query.includes('analysis_point_units')) return [{ unitsId: 3 }];
        return [];
      }),
    };
    const service = new UnitConversionService(db as never);
    return { service, db };
  }
  it('uses source bounds without checking inheritance', async () => {
    const { service, db } = setup(true, true);
    expect(await service.normalizeForSource(input, 5)).toMatchObject({
      inherited: false,
      reference: { status: '0' },
    });
    expect(
      db.query.mock.calls.some(([q]) =>
        q.includes('sourceReferenceInheritance'),
      ),
    ).toBe(false);
  });
  it('uses general bounds only when inherited', async () => {
    const { service, db } = setup(false, true);
    expect(await service.normalizeForSource(input, 5)).toMatchObject({
      inherited: true,
      reference: { status: '0' },
    });
    const referenceCall = db.query.mock.calls.find(
      ([q]) =>
        q.includes('analysisPointMinValue') && q.startsWith('SELECT "pointId"'),
    );
    expect(referenceCall?.[0]).toContain(
      '"sourceId" IS NOT DISTINCT FROM :sourceId',
    );
  });
  it('does not fall back without inheritance', async () => {
    const { service } = setup(false, false);
    await expect(service.normalizeForSource(input, 5)).rejects.toEqual(
      new UnitNormalizationError('no_source_reference'),
    );
  });
});
