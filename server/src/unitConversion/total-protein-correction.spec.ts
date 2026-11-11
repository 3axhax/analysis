import { Op } from 'sequelize';
import { AgesService } from '../ages/ages.service';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
import { normalizeToReference } from './reference-normalization';

describe('total protein age and reference boundaries', () => {
  const intervals = [
    { id: 1, intervalDayStart: 91, intervalDayEnd: 180 },
    { id: 2, intervalDayStart: 181, intervalDayEnd: 210 },
    { id: 3, intervalDayStart: 211, intervalDayEnd: 360 },
    { id: 4, intervalDayStart: 361, intervalDayEnd: 720 },
  ];
  const repo = { findOne: jest.fn(async ({ where }) => intervals.find(x => x.intervalDayStart <= where.intervalDayStart[Op.lte] && x.intervalDayEnd >= where.intervalDayEnd[Op.gte]) ?? null) };
  const service = new AgesService(repo as never, {} as never);

  it.each([[180,1], [181,2], [209,2], [210,2], [211,3], [360,3], [361,4]])('selects the group for day %i', async (day, expected) => {
    expect((await service.getAgeByDays(day))?.id).toBe(expected);
  });

  it.each<Array<[number, string, string]>[number]>([[2,'44','76'], [3,'51','73']])('uses the correct limits for both sexes', (ageId, min, max) => {
    for (const genderId of [1,2]) {
      const key = { pointId: 27, ageId, genderId, unitId: 1 };
      const input = { ...key, sourceUnitId: 1, sourceValue: min, allowedUnitIds: [1], minimums: [{ ...key, value: min }], maximums: [{ ...key, value: max }], rules: [] };
      for (const [value, expected] of [[Number(min)-0.01,StatusValue.LOW],[Number(min),StatusValue.NORMAL],[Number(max),StatusValue.NORMAL],[Number(max)+0.01,StatusValue.HIGH]] as const) {
        expect(normalizeToReference({ ...input, sourceValue: value.toFixed(2) }).status).toBe(expected);
      }
    }
  });
});
