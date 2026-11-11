import { Op } from 'sequelize';
import { AgesService } from './ages.service';

describe('CBC age split boundaries', () => {
  const intervals = [
    { id: 1, intervalDayStart: 0, intervalDayEnd: 360 },
    { id: 2, intervalDayStart: 361, intervalDayEnd: 720 },
    { id: 3, intervalDayStart: 721, intervalDayEnd: 1080 },
    { id: 4, intervalDayStart: 1081, intervalDayEnd: 1440 },
    { id: 5, intervalDayStart: 1441, intervalDayEnd: 1800 },
    { id: 6, intervalDayStart: 1801, intervalDayEnd: 2160 },
    { id: 7, intervalDayStart: 2161, intervalDayEnd: 2880 },
    { id: 8, intervalDayStart: 2881, intervalDayEnd: 3240 },
    { id: 9, intervalDayStart: 3241, intervalDayEnd: 5400 },
    { id: 10, intervalDayStart: 5401, intervalDayEnd: 5760 },
    { id: 11, intervalDayStart: 5761, intervalDayEnd: 6479 },
    { id: 12, intervalDayStart: 6480, intervalDayEnd: 6839 },
    { id: 13, intervalDayStart: 6840, intervalDayEnd: 72000 },
  ];
  const repo = {
    findOne: jest.fn(async ({ where }) => intervals.find((x) => x.intervalDayStart <= where.intervalDayStart[Op.lte] && x.intervalDayEnd >= where.intervalDayEnd[Op.gte]) ?? null),
    findAll: jest.fn(async () => []),
  };
  const service = new AgesService(repo as never, {} as never);
  it.each([[719,2],[720,2],[721,3],[1439,4],[1440,4],[1441,5],[2879,7],[2880,7],[2881,8],[4680,9],[5759,10],[5760,10],[5761,11],[6479,11],[6480,12],[6839,12],[6840,13]])('selects age group for day %i', async (day, expected) => {
    expect((await service.getAgeByDays(day))?.id).toBe(expected);
  });
  it('orders the public age dictionary by start day', async () => {
    await service.getAll();
    expect(repo.findAll).toHaveBeenCalledWith(expect.objectContaining({ order: [['intervalDayStart','ASC'],['id','ASC']] }));
  });
});
