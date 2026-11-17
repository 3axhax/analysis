import { IntervalResultReadService } from './interval-result-read.service';
import { SourcedInterval } from './interval-evaluator';
import { IntervalReaderService } from './interval-reader.service';
import { IntervalResultService } from './interval-result.service';
import { Sequelize } from 'sequelize-typescript';

describe('interval result read path', () => {
  function setup(intervals: SourcedInterval[] = []) {
    const plain = {
      ageId: 1,
      genderId: 2,
      analysisResultPointData: [
        {
          id: 1,
          pointId: 3,
          point: { id: 3, name: 'example' },
          value: 5,
          sourceValue: '5.000000000000000000',
          sourceUnitId: 4,
          unitId: 4,
          sourceUnitText: null,
        },
      ],
    };
    const results = {
      findOne: jest
        .fn()
        .mockResolvedValue({ get: () => structuredClone(plain) }),
    };
    const units = {
      getAll: jest.fn().mockResolvedValue([{ id: 4, name: 'unit' }]),
    };
    const evaluator = {
      evaluate: jest.fn().mockResolvedValue({
        points: [{ pointId: 3, intervals }],
        descriptions: [],
        sourceDescriptions: [],
        warnings: [],
        references: [],
        displayReferences: [],
      }),
    };
    const conversions = { sourceCatalog: jest.fn().mockResolvedValue([]) };
    const args = [
      results,
      {},
      units,
      conversions,
      evaluator,
      { query: jest.fn().mockResolvedValue([]) },
    ] as unknown as ConstructorParameters<typeof IntervalResultReadService>;
    return {
      service: new IntervalResultReadService(...args),
      evaluator,
      conversions,
    };
  }
  it('includes an unmatched external reference with document and root metadata', async () => {
    const { service, evaluator, conversions } = setup();
    conversions.sourceCatalog.mockResolvedValue([
      { id: 1, parentId: null, name: 'root', metadata: {} },
      { id: 9, parentId: 1, name: 'document', metadata: { title: 'source' } },
    ]);
    evaluator.evaluate.mockResolvedValue({
      points: [{ pointId: 3, intervals: [] }],
      descriptions: [],
      sourceDescriptions: [],
      warnings: [],
      references: [],
      displayReferences: [
        {
          id: 6,
          pointId: 3,
          ageId: 1,
          genderId: 2,
          unitId: 4,
          sourceId: 9,
          status: 'NORMAL',
          minValue: '1',
          maxValue: '2',
          minValueEqual: true,
          maxValueEqual: false,
          minApproximate: true,
        },
      ],
    });
    const response = await service.read('synthetic');
    expect(response.result?.analysisResultPointData[0]).toMatchObject({
      matchingIntervals: [],
      displayReferences: [
        {
          id: 6,
          minApproximate: true,
          source: {
            id: 9,
            rootId: 1,
            rootName: 'root',
            metadata: { title: 'source' },
          },
        },
      ],
    });
  });
  it('keeps a measurement without a matching interval visible and without a status', async () => {
    const { service, evaluator } = setup();
    const response = await service.read('synthetic');
    expect(response.result?.analysisResultPointData[0]).toMatchObject({
      value: 5,
      displayValue: '5',
      pointDataStatus: null,
      matchingIntervals: [],
    });
    expect(evaluator.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        measurements: [
          expect.objectContaining({
            pointId: 3,
            value: '5.000000000000000000',
            unitId: 4,
          }),
        ],
      }),
    );
  });
  it('returns every overlapping interval without choosing conflicting statuses', async () => {
    const base = {
      pointId: 3,
      ageId: 1,
      genderId: 2,
      unitId: 4,
      sourceId: null,
      minValue: '0',
      maxValue: null,
      minValueEqual: true,
      maxValueEqual: null,
    };
    const { service } = setup([
      { ...base, id: 1, status: 'LOW' },
      { ...base, id: 2, status: 'HIGH' },
    ]);
    const response = await service.read('synthetic');
    const point = response.result?.analysisResultPointData[0];
    expect(point?.pointDataStatus).toBeNull();
    expect(point?.matchingIntervals).toHaveLength(2);
  });
  it('retains a status-free interval without displaying a status', async () => {
    const { service } = setup([
      {
        id: 1,
        pointId: 3,
        unitId: 4,
        ageId: 1,
        genderId: 2,
        sourceId: null,
        status: null,
        minValue: '0',
        maxValue: null,
        minValueEqual: true,
        maxValueEqual: null,
      },
    ]);
    const response = await service.read('synthetic');
    expect(response.result?.analysisResultPointData[0]).toMatchObject({
      pointDataStatus: null,
      matchingIntervals: [{ status: null, unit: 'unit' }],
    });
  });
  it('evaluates a cross-source description through the complete read path', async () => {
    const point = {
      id: 1,
      pointId: 3,
      point: { id: 3, name: 'example' },
      value: 5,
      sourceValue: '5',
      sourceUnitId: 4,
      unitId: 4,
      sourceUnitText: null,
    };
    const results = {
      findOne: jest.fn().mockResolvedValue({
        get: () => ({
          ageId: 1,
          genderId: 2,
          analysisResultPointData: [point],
        }),
      }),
    };
    const db = {
      query: jest.fn((sql: string) => {
        if (sql.includes('FROM "analysisPointIntervalValue"'))
          return Promise.resolve([
            {
              id: 6,
              sourceId: 9,
              pointId: 3,
              ageId: 1,
              genderId: 2,
              unitId: 4,
              minValue: '5',
              maxValue: '5',
              minValueEqual: true,
              maxValueEqual: true,
              status: 'LOW',
            },
          ]);
        if (sql.includes('FROM analysis_point_units'))
          return Promise.resolve([{ pointId: 3, unitId: 4 }]);
        if (sql.includes('FROM "unitConversionRule"'))
          return Promise.resolve([]);
        if (sql.includes('FROM "analysisResultDescriptionCondition"'))
          return Promise.resolve([
            {
              descriptionId: 10,
              conditionId: 11,
              pointId: 3,
              pointName: 'example',
              intervalId: 6,
            },
          ]);
        if (sql.includes('description_ru FROM'))
          return Promise.resolve([{ id: 10, description_ru: 'example text' }]);
        if (sql.includes('FROM "analysisResultDescription"'))
          return Promise.resolve([{ id: 10, sourceId: 8 }]);
        throw new Error('unexpected query');
      }),
    };
    const reader = new IntervalReaderService(db as unknown as Sequelize);
    const sources = [
      { id: 7, parentId: null, name: 'root', metadata: {} },
      { id: 8, parentId: 7, name: 'description', metadata: {} },
      { id: 9, parentId: 7, name: 'interval', metadata: {} },
    ];
    const args = [
      results,
      {},
      { getAll: jest.fn().mockResolvedValue([{ id: 4, name: 'unit' }]) },
      { sourceCatalog: jest.fn().mockResolvedValue(sources) },
      new IntervalResultService(reader),
      db,
    ] as unknown as ConstructorParameters<typeof IntervalResultReadService>;
    const response = await new IntervalResultReadService(...args).read(
      'synthetic',
    );
    expect(response.result?.analysisResultPointData[0]).toMatchObject({
      value: 5,
      pointDataStatus: '0',
      matchingIntervals: [{ id: 6, sourceId: 9 }],
    });
    expect(response.sourceDescriptions).toMatchObject([
      {
        source: { id: 8 },
        descriptions: [
          {
            id: 10,
            analysisResultDescriptionConditions: [
              {
                id: 11,
                status: '0',
                analysisPoint: { id: 3, name: 'example' },
                intervals: [{ id: 6 }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
