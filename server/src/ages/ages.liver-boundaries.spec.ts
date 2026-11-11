import { Op } from 'sequelize';
import { AgesService } from './ages.service';

describe('liver reference age boundaries', () => {
  const groups = [
    { name: '3_4y', intervalDayStart: 1081, intervalDayEnd: 1439 },
    { name: '4y', intervalDayStart: 1440, intervalDayEnd: 1440 },
    { name: '4_5y', intervalDayStart: 1441, intervalDayEnd: 1800 },
    { name: '6_7y', intervalDayStart: 2161, intervalDayEnd: 2519 },
    { name: '7_8y', intervalDayStart: 2520, intervalDayEnd: 2880 },
    { name: '12_13y', intervalDayStart: 4321, intervalDayEnd: 4679 },
    { name: '13_14y', intervalDayStart: 4680, intervalDayEnd: 5039 },
    { name: '16_17y', intervalDayStart: 5761, intervalDayEnd: 6119 },
    { name: '17_18y', intervalDayStart: 6120, intervalDayEnd: 6479 },
    { name: '18_19y', intervalDayStart: 6480, intervalDayEnd: 6839 },
    { name: 'u19y', intervalDayStart: 6840, intervalDayEnd: 72000 },
  ];
  const repo = { findOne: jest.fn(async ({ where }) => groups.find((a) => a.intervalDayStart <= where.intervalDayStart[Op.lte] && a.intervalDayEnd >= where.intervalDayEnd[Op.gte]) ?? null) };
  const service = new AgesService(repo as never, {} as never);
  it.each([[1439,'3_4y'],[1440,'4y'],[1441,'4_5y'],[2519,'6_7y'],[2520,'7_8y'],[4679,'12_13y'],[4680,'13_14y'],[6119,'16_17y'],[6120,'17_18y'],[6479,'17_18y'],[6480,'18_19y'],[6839,'18_19y'],[6840,'u19y']])('selects the correct group on day %i', async (day, expected) => {
    expect((await service.getAgeByDays(day))?.name).toBe(expected);
  });
});
