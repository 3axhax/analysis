import { Op } from 'sequelize';
import { AgesService } from './ages.service';

describe('neonatal bilirubin age boundaries', () => {
  const groups = [
    { name: '0d', intervalDayStart: 0, intervalDayEnd: 0 },
    { name: '1_2d', intervalDayStart: 1, intervalDayEnd: 2 },
    { name: '3d', intervalDayStart: 3, intervalDayEnd: 3 },
    { name: '4_5d', intervalDayStart: 4, intervalDayEnd: 5 },
    { name: '6d', intervalDayStart: 6, intervalDayEnd: 6 },
    { name: '7_30d', intervalDayStart: 7, intervalDayEnd: 30 },
    { name: '1_2m', intervalDayStart: 31, intervalDayEnd: 60 },
  ];
  const repo = { findOne: jest.fn(async ({ where }) => groups.find((a) => a.intervalDayStart <= where.intervalDayStart[Op.lte] && a.intervalDayEnd >= where.intervalDayEnd[Op.gte]) ?? null) };
  const service = new AgesService(repo as never, {} as never);
  it.each([[0,'0d'],[1,'1_2d'],[2,'1_2d'],[3,'3d'],[4,'4_5d'],[5,'4_5d'],[6,'6d'],[7,'7_30d'],[30,'7_30d'],[31,'1_2m']])('selects the correct group on day %i', async (day, expected) => {
    expect((await service.getAgeByDays(day))?.name).toBe(expected);
  });
});
