import { plainToInstance } from 'class-transformer';
import { AnalysisPointService } from './analysisPoint.service';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AddNewAnalysisPointQueryDto } from './dto/analysisPoint.dto';

describe('admin reference bounds', () => {
  const minService = { addNewPointMinValue: jest.fn() };
  const maxService = { addNewPointMaxValue: jest.fn() };
  const lookup = { id: 1 };
  const service = new AnalysisPointService(
    {} as never,
    {} as never,
    maxService as never,
    minService as never,
    { getAgeByName: async () => lookup } as never,
    { getGenderByName: async () => lookup } as never,
    { getAnalysisPointUnitsByName: async () => lookup } as never,
  );
  const dimensions = { age: 'adult', gender: 'm', unit: 'unit' };
  beforeEach(() => jest.clearAllMocks());

  it('preserves missing bounds, zero and inclusive lower boundary when formatting', () => {
    const common = {
      ageId: 1,
      genderId: 1,
      unitId: 1,
      age: { name: 'adult' },
      gender: { name: 'm' },
      unit: { name: 'unit' },
    };
    expect(
      service._formatLimits([{ ...common, value: 0 }] as never, []),
    ).toEqual([
      { ...dimensions, minValue: null, maxValue: 0, lowInclusive: false },
    ]);
    expect(
      service._formatLimits([], [
        { ...common, value: 0, lowInclusive: true },
      ] as never),
    ).toEqual([
      { ...dimensions, minValue: 0, maxValue: null, lowInclusive: true },
    ]);
  });

  it('writes only present bounds and retains zero and inclusive flag', async () => {
    await service._addLimitsToPoint({
      pointId: 2,
      limits: [
        { ...dimensions, minValue: 0, maxValue: null, lowInclusive: true },
      ],
    });
    expect(minService.addNewPointMinValue).toHaveBeenCalledWith(
      expect.objectContaining({ value: 0, sourceId: null, lowInclusive: true }),
    );
    expect(maxService.addNewPointMaxValue).not.toHaveBeenCalled();
    jest.clearAllMocks();
    await service._addLimitsToPoint({
      pointId: 2,
      limits: [{ ...dimensions, minValue: null, maxValue: 0 }],
    });
    expect(minService.addNewPointMinValue).not.toHaveBeenCalled();
    expect(maxService.addNewPointMaxValue).toHaveBeenCalledWith(
      expect.objectContaining({ value: 0, sourceId: null }),
    );
  });

  it('parses blank as missing and rejects malformed numbers', () => {
    const dto = plainToInstance(AddNewAnalysisPointQueryDto, {
      limits: [{ ...dimensions, minValue: '', maxValue: '0,5' }],
    });
    expect(dto.limits[0]).toMatchObject({ minValue: null, maxValue: 0.5 });
    expect(() =>
      plainToInstance(AddNewAnalysisPointQueryDto, {
        limits: [{ ...dimensions, minValue: '1abc' }],
      }),
    ).toThrow();
  });
  it('retains units used by source-specific bounds when common units change', async () => {
    const point = { removeAllUnits: jest.fn(), addUnits: jest.fn() };
    const local = new AnalysisPointService(
      { findByPk: async () => point } as never, {} as never, maxService as never, minService as never,
      {} as never, {} as never, { getAnalysisPointUnitsByName: async () => ({ id: 2 }) } as never,
    );
    const mins = jest.spyOn(AnalysisPointMinValue, 'findAll').mockResolvedValue([{ unitId: 7 }] as never);
    const maxes = jest.spyOn(AnalysisPointMaxValue, 'findAll').mockResolvedValue([] as never);
    try {
      await local._addUnitsToPointFromLimits({ pointId: 1, limits: [{ ...dimensions, minValue: 1, maxValue: 2 }] });
      expect(point.addUnits).toHaveBeenCalledWith(expect.arrayContaining([2, 7]));
    } finally { mins.mockRestore(); maxes.mockRestore(); }
  });

});
