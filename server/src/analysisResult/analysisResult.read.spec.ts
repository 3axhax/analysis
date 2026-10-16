import { AnalysisResultService } from './analysisResult.service';
import { normalizeToReference } from '../unitConversion/reference-normalization';
import type { UnitConversionService } from '../unitConversion/unit-conversion.service';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

describe('legacy result read unit normalization (synthetic)', () => {
  const setup = (validReference = true) => {
    const point = {
      pointId: 10,
      unitId: 16,
      value: 33,
      sourceValue: null,
      sourceUnitId: null,
      sourceUnitText: null,
      pointUnit: { id: 16, name: 'g/dl' },
    };
    const original = {
      ageId: 1,
      genderId: 1,
      analysisResultPointData: [point],
    };
    const findOne = jest.fn().mockResolvedValue({
      get: () => structuredClone(original),
    });
    const normalize = jest.fn(
      (input: Parameters<UnitConversionService['normalize']>[0]) =>
        Promise.resolve(
          normalizeToReference({
            ...input,
            allowedUnitIds: [2, 16],
            minimums: [
              { pointId: 10, ageId: 1, genderId: 1, unitId: 2, value: 300 },
            ],
            maximums: [
              {
                pointId: 10,
                ageId: 1,
                genderId: 1,
                unitId: 2,
                value: validReference ? 380 : 200,
              },
            ],
            rules: [
              {
                id: 1,
                fromUnitId: 16,
                toUnitId: 2,
                coefficient: '10',
                version: 1,
                active: true,
                pointId: null,
              },
            ],
          }),
        ),
    );
    const descriptions = jest.fn().mockResolvedValue([]);
    const args = [
      { findOne },
      {},
      {},
      {},
      {
        getAll: jest.fn().mockResolvedValue([
          { id: 2, name: 'g/l' },
          { id: 16, name: 'g/dl' },
        ]),
      },
      {},
      { getDescriptionsByConditions: descriptions },
      { normalize },
    ] as unknown as ConstructorParameters<typeof AnalysisResultService>;
    return {
      service: new AnalysisResultService(...args),
      descriptions,
      original,
    };
  };

  it('returns source-unit bounds and a separate converted calculation for an old row', async () => {
    const s = setup();
    const before = structuredClone(s.original);
    const response = await s.service.getResultByResultId({
      resultId: 'synthetic',
    });
    expect(response.result?.analysisResultPointData[0]).toMatchObject({
      value: 33,
      unitId: 16,
      pointUnit: { name: 'g/dl' },
      minValue: 30,
      maxValue: 38,
      pointDataStatus: StatusValue.NORMAL,
      calculation: {
        value: '330',
        unitId: 2,
        unit: 'g/l',
        coefficient: '10',
        minValue: '300',
        maxValue: '380',
      },
    });
    expect(s.descriptions).toHaveBeenCalledWith({ 10: StatusValue.NORMAL });
    expect(s.original).toEqual(before);
  });

  it('does not attach raw target-unit bounds or a status when the reference is invalid', async () => {
    const s = setup(false);
    const response = await s.service.getResultByResultId({
      resultId: 'synthetic',
    });
    const point = response.result?.analysisResultPointData[0];
    expect(point).toMatchObject({
      value: 33,
      unitId: 16,
      minValue: null,
      maxValue: null,
      pointDataStatus: null,
    });
    expect(point?.calculation).toBeUndefined();
    expect(point?.interpretationWarning).toBeTruthy();
    expect(s.descriptions).toHaveBeenCalledWith({});
  });

  it('normalizes a source-only measurement at read time', async () => {
    const s = setup();
    Object.assign(s.original.analysisResultPointData[0], {
      sourceValue: '33',
      sourceUnitId: 16,
      sourceUnitText: 'г/дл',
      calculationValue: null,
      appliedCoefficient: null,
      conversionRuleId: null,
      conversionRuleVersion: null,
      referenceMin: null,
      referenceMax: null,
    });
    const response = await s.service.getResultByResultId({
      resultId: 'synthetic',
    });
    expect(response.result?.analysisResultPointData[0]).toMatchObject({
      value: 33,
      sourceUnitText: 'г/дл',
      pointDataStatus: StatusValue.NORMAL,
      calculation: { value: '330', coefficient: '10' },
    });
  });

  it('keeps every row when one parameter has no reference', async () => {
    const s = setup();
    s.original.analysisResultPointData.push({
      ...s.original.analysisResultPointData[0],
      pointId: 11,
      value: 5,
    });
    const response = await s.service.getResultByResultId({
      resultId: 'synthetic',
    });
    const rows = response.result?.analysisResultPointData;
    expect(rows).toHaveLength(2);
    expect(rows?.[0].pointDataStatus).toBe(StatusValue.NORMAL);
    expect(rows?.[1]).toMatchObject({
      pointId: 11,
      value: 5,
      unitId: 16,
      minValue: null,
      maxValue: null,
      pointDataStatus: null,
      interpretationWarning: 'no_convertible_reference_range',
    });
    expect(s.descriptions).toHaveBeenCalledWith({ 10: StatusValue.NORMAL });
  });
});
