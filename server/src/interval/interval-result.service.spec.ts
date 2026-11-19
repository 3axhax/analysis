import { IntervalReaderService } from './interval-reader.service';
import { IntervalResultService } from './interval-result.service';

describe('interval result service', () => {
  it('combines matched conditions with description text without filtering interval sources', async () => {
    const interval = {
      id: 1,
      sourceId: 3,
      pointId: 4,
      ageId: 5,
      genderId: 6,
      unitId: 7,
      minValue: '1',
      maxValue: null,
      minValueEqual: true,
      maxValueEqual: null,
      status: null,
    };
    const reader = {
      evaluate: jest.fn().mockResolvedValue({
        intervals: [interval],
        descriptions: [
          {
            id: 8,
            sourceId: 2,
            conditions: [{ id: 10, pointId: 4, intervalIds: [1] }],
          },
        ],
        warnings: [],
        references: [],
        displayReferences: [],
      }),
    };
    const service = new IntervalResultService(
      reader as unknown as IntervalReaderService,
    );
    const result = await service.evaluate({
      ageIds: [5],
      measurements: [
        { pointId: 4, ageIds: [5], genderId: 6, unitId: 7, value: '2' },
      ],
      descriptions: [{ id: 8, description_ru: 'example' }],
      sources: [
        { id: 1, parentId: null, name: 'root', metadata: {} },
        { id: 2, parentId: 1, name: 'description', metadata: {} },
        { id: 3, parentId: 1, name: 'interval', metadata: {} },
      ],
    });
    expect(result.sourceDescriptions[0].descriptions[0]).toMatchObject({
      description_ru: 'example',
      conditions: [{ id: 10, intervals: [{ sourceId: 3, status: null }] }],
    });
  });
  it.each([[[], false], [[5], false], [[5, 9], true], [[9], true]] as const)(
    'scopes source eligibility to matching age IDs %j',
    async (ageIds, applicable) => {
      const reader = {
        evaluate: jest.fn().mockResolvedValue({
          intervals: [], descriptions: [], warnings: [],
          references: [], displayReferences: [],
        }),
      };
      const service = new IntervalResultService(reader as unknown as IntervalReaderService);
      const root = { id: 1, parentId: null, name: 'root', metadata: {} };
      const newborn = {
        id: 2, parentId: 1, name: 'newborn',
        metadata: {}, ageIds: [9],
      };
      await service.evaluate({
        ageIds, measurements: [], descriptions: [],
        sources: [root, newborn],
      });
      expect(reader.evaluate).toHaveBeenCalledWith([], applicable ? [root, newborn] : [root]);
    },
  );
});
