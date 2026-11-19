import { IntervalReaderService } from './interval-reader.service';
import { Sequelize } from 'sequelize-typescript';

describe('interval reader', () => {
  it('matches a description from one source using an interval from another', async () => {
    const results = [
      [
        {
          id: 1,
          sourceId: 10,
          pointId: 1,
          ageId: 2,
          genderId: 3,
          unitId: 4,
          minValue: '5',
          maxValue: null,
          minValueEqual: true,
          maxValueEqual: null,
          status: null,
        },
      ],
      [{ pointId: 1, unitId: 4 }],
      [],
      [
        { id: 8, sourceId: 20 },
        { id: 9, sourceId: 20 },
      ],
      [
        {
          descriptionId: 8,
          conditionId: 12,
          pointId: 1,
          pointName: 'example',
          intervalId: 1,
        },
        {
          descriptionId: 9,
          conditionId: 13,
          pointId: 1,
          pointName: 'example',
          intervalId: null,
        },
      ],
    ];
    const query = jest
      .fn()
      .mockImplementation(() => Promise.resolve(results.shift()));
    const service = new IntervalReaderService({
      query,
    } as unknown as Sequelize);
    const result = await service.evaluate(
      [{ pointId: 1, ageIds: [2], genderId: 3, unitId: 4, value: '5' }],
      [{ id: 10, parentId: 1, name: 'interval', metadata: {} }],
    );
    expect(result.descriptions.map((item) => item.id)).toEqual([8]);
    expect(result.intervals[0].status).toBeNull();
    expect(query).toHaveBeenCalledTimes(5);
  });
  it('does not query the database for an empty result', async () => {
    const query = jest.fn();
    const service = new IntervalReaderService({
      query,
    } as unknown as Sequelize);
    expect(await service.evaluate([], [])).toEqual({
      intervals: [],
      descriptions: [],
      warnings: [],
      references: [],
      displayReferences: [],
    });
    expect(query).not.toHaveBeenCalled();
  });
  it('respects interval source age scope even when a description uses another source', async () => {
    const results = [
      [
        {
          id: 1,
          sourceId: 10,
          pointId: 1,
          ageId: 2,
          genderId: 3,
          unitId: 4,
          minValue: '5',
          maxValue: null,
          minValueEqual: true,
          maxValueEqual: null,
          status: null,
        },
      ],
      [{ pointId: 1, unitId: 4 }],
      [],
      [{ id: 8, sourceId: 20 }],
      [
        {
          descriptionId: 8,
          conditionId: 12,
          pointId: 1,
          pointName: 'example',
          intervalId: 1,
        },
      ],
    ];
    const query = jest
      .fn()
      .mockImplementation(() => Promise.resolve(results.shift()));
    const service = new IntervalReaderService({
      query,
    } as unknown as Sequelize);
    const result = await service.evaluate(
      [{ pointId: 1, ageIds: [2], genderId: 3, unitId: 4, value: '5' }],
      [
        {
          id: 10,
          parentId: 1,
          name: 'interval',
          metadata: {}, ageIds: [99],
        },
      ],
    );
    expect(result.intervals).toEqual([]);
    expect(result.descriptions).toEqual([]);
  });
});
