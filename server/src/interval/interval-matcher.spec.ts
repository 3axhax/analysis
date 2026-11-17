import {
  Interval,
  matchesConditions,
  matchesInterval,
  validateInterval,
} from './interval-matcher';

const interval: Interval = {
  id: 1,
  pointId: 2,
  ageId: 3,
  genderId: 4,
  unitId: 5,
  minValue: '1.000000000000000001',
  maxValue: '2',
  minValueEqual: true,
  maxValueEqual: false,
};
const measurement = {
  pointId: 2,
  ageId: 3,
  genderId: 4,
  unitId: 5,
  value: '1',
};

describe('interval matching', () => {
  it.each([
    ['1.000000000000000000', false],
    ['1.000000000000000001', true],
    ['1.999999999999999999', true],
    ['2', false],
    ['2.000000000000000001', false],
  ])('compares %s without rounding', (value, expected) => {
    expect(matchesInterval(interval, { ...measurement, value })).toBe(expected);
  });
  it('supports both open ends and a closed single point', () => {
    expect(
      matchesInterval(
        { ...interval, minValue: null, minValueEqual: null },
        measurement,
      ),
    ).toBe(true);
    expect(
      matchesInterval(
        { ...interval, maxValue: null, maxValueEqual: null },
        { ...measurement, value: '100' },
      ),
    ).toBe(true);
    const point = {
      ...interval,
      minValue: 0,
      maxValue: 0,
      minValueEqual: true,
      maxValueEqual: true,
    };
    expect(matchesInterval(point, { ...measurement, value: 0 })).toBe(true);
    expect(() => validateInterval({ ...point, maxValueEqual: false })).toThrow(
      'empty_interval',
    );
  });
  it('accepts decimal commas without rounding and rejects non-decimal notation', () => {
    const bound = {
      ...interval,
      minValue: '1,5',
      maxValue: '1,5',
      minValueEqual: true,
      maxValueEqual: true,
    };
    expect(matchesInterval(bound, { ...measurement, value: '1.5' })).toBe(true);
    expect(() => validateInterval({ ...interval, minValue: '0xff' })).toThrow(
      'invalid_interval_number',
    );
  });
  it('compares a calculated ratio by cross products without rounding', () => {
    const point = {
      ...interval,
      minValue: '1.7',
      maxValue: '1.7',
      minValueEqual: true,
      maxValueEqual: true,
    };
    expect(
      matchesInterval(point, {
        ...measurement,
        value: '1.699999999999999999',
        fraction: { numerator: '17', denominator: '10' },
      }),
    ).toBe(true);
    expect(
      matchesInterval(point, {
        ...measurement,
        value: '1.7',
        fraction: {
          numerator: '1699999999999999999',
          denominator: '1000000000000000000',
        },
      }),
    ).toBe(false);
  });
  it.each(['pointId', 'ageId', 'genderId', 'unitId'] as const)(
    'requires the same %s',
    (field) => {
      expect(
        matchesInterval(interval, {
          ...measurement,
          [field]: 99,
          value: '1.5',
        }),
      ).toBe(false);
    },
  );
  it('combines alternatives with OR and conditions with AND, without cross-point matches', () => {
    const conditions = [
      { pointId: 2, intervalIds: [1, 2] },
      { pointId: 8, intervalIds: [3] },
    ];
    expect(
      matchesConditions(conditions, [
        { id: 2, pointId: 2 },
        { id: 3, pointId: 8 },
      ]),
    ).toBe(true);
    expect(matchesConditions(conditions, [{ id: 2, pointId: 2 }])).toBe(false);
    expect(
      matchesConditions(conditions, [
        { id: 2, pointId: 8 },
        { id: 3, pointId: 8 },
      ]),
    ).toBe(false);
    expect(matchesConditions([], [])).toBe(false);
    expect(matchesConditions([{ pointId: 2, intervalIds: [] }], [])).toBe(
      false,
    );
  });
  it('rejects missing or invalid bounds and nonfinite measurements', () => {
    expect(() =>
      validateInterval({
        ...interval,
        minValue: null,
        minValueEqual: null,
        maxValue: null,
        maxValueEqual: null,
      }),
    ).toThrow();
    expect(() => validateInterval({ ...interval, minValue: null })).toThrow();
    expect(() =>
      validateInterval({
        ...interval,
        minValueEqual: undefined as unknown as boolean,
      }),
    ).toThrow();
    expect(() => validateInterval({ ...interval, minValue: 3 })).toThrow();
    expect(() =>
      validateInterval({ ...interval, minValue: '0.0000000000000000001' }),
    ).toThrow('invalid_interval_precision');
    expect(() =>
      matchesInterval(interval, { ...measurement, value: 'Infinity' }),
    ).toThrow();
  });
});
