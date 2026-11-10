import { UnitConversionService } from './unit-conversion.service';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

describe('thyroid source references', () => {
  const pmol = 10;
  const umol = 11;
  const source = 20;

  it.each([
    ['FT3', '3.1', '6.8'],
    ['FT4', '10.8', '22'],
  ])(
    '%s inherits the corrected common reference for both sexes',
    async (_name, min, max) => {
      const db = {
        query: jest.fn(
          async (
            query: string,
            options: {
              replacements: {
                pointId: number;
                ageId: number;
                genderId: number;
                sourceId: number | null;
              };
            },
          ) => {
            if (query.startsWith('SELECT EXISTS')) return [{ present: false }];
            if (query.includes('sourceReferenceInheritance'))
              return [{ count: '1' }];
            const { pointId, ageId, genderId, sourceId } = options.replacements;
            if (query.includes('analysisPointMinValue')) {
              expect(sourceId).toBeNull();
              return [{ pointId, ageId, genderId, unitId: pmol, value: min }];
            }
            if (query.includes('analysisPointMaxValue')) {
              expect(sourceId).toBeNull();
              return [{ pointId, ageId, genderId, unitId: pmol, value: max }];
            }
            if (query.includes('analysis_point_units'))
              return [{ unitsId: pmol }, { unitsId: umol }];
            if (query.includes('unitConversionRule'))
              return [
                {
                  id: 1,
                  fromUnitId: umol,
                  toUnitId: pmol,
                  coefficient: '1000000',
                  version: 1,
                  active: true,
                  pointId,
                },
              ];
            return [];
          },
        ),
      };
      const service = new UnitConversionService(db as never);
      for (const genderId of [1, 2]) {
        for (const [value, expected] of [
          [Number(min) - 0.001, StatusValue.LOW],
          [Number(min), StatusValue.NORMAL],
          [Number(max), StatusValue.NORMAL],
          [Number(max) + 0.001, StatusValue.HIGH],
        ] as const) {
          for (const unit of [pmol, umol]) {
            const result = await service.normalizeForSource(
              {
                pointId: 1,
                ageId: 1,
                genderId,
                sourceUnitId: unit,
                sourceValue:
                  unit === pmol
                    ? value.toFixed(3)
                    : (value / 1_000_000).toFixed(9),
              },
              source,
            );
            expect(result).toMatchObject({
              inherited: true,
              reference: { status: expected },
            });
          }
        }
      }
    },
  );
});
