import { Op } from 'sequelize';
import { AgesService } from './ages.service';

describe('age split at fourteen years', () => {
  const groups = [
    { id: 12, intervalDayStart: 4321, intervalDayEnd: 5039 },
    { id: 21, intervalDayStart: 5040, intervalDayEnd: 5400 },
    { id: 13, intervalDayStart: 5401, intervalDayEnd: 5760 },
  ];
  const repository = {
    findOne: jest.fn(async ({ where }) =>
      groups.find((age) => age.intervalDayStart <= where.intervalDayStart[Op.lte] && age.intervalDayEnd >= where.intervalDayEnd[Op.gte]) ?? null,
    ),
  };
  const service = new AgesService(repository as never, {} as never);
  it.each([[5039, 12], [5040, 21], [5041, 21], [5400, 21], [5401, 13]])('uses the right group at day %i', async (day, expected) => {
    expect((await service.getAgeByDays(day))?.id).toBe(expected);
  });
});
