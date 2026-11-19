import { matchConvertedIntervals } from './interval-conversion';
import { Interval } from './interval-matcher';
import { UnitConversionRule } from '../unitConversion/reference-normalization';

const measurement = {
  pointId: 1,
  ageIds: [2],
  genderId: 3,
  unitId: 4,
  value: '0.3',
};
const base: Interval = {
  id: 1,
  pointId: 1,
  ageId: 2,
  genderId: 3,
  unitId: 5,
  minValue: '3',
  maxValue: null,
  minValueEqual: true,
  maxValueEqual: null,
};
const rule: UnitConversionRule = {
  id: 1,
  version: 1,
  fromUnitId: 4,
  toUnitId: 5,
  coefficient: '10',
  active: true,
  pointId: null,
};
describe('matching independently converted intervals', () => {
  it('matches overlapping intervals in different units using exact products', () => {
    const exact = { ...base, id: 2, unitId: 4, minValue: '0.3' };
    expect(
      matchConvertedIntervals(measurement, [base, exact], [4, 5], [rule]).map(
        (i) => i.id,
      ),
    ).toEqual([1, 2]);
    expect(
      matchConvertedIntervals(
        { ...measurement, value: '0.299999999999999999' },
        [base],
        [4, 5],
        [rule],
      ),
    ).toEqual([]);
  });
  it('does not infer conversions or apply a rule for another point', () => {
    expect(matchConvertedIntervals(measurement, [base], [4, 5], [])).toEqual(
      [],
    );
    expect(
      matchConvertedIntervals(
        measurement,
        [base],
        [4, 5],
        [{ ...rule, pointId: 9 }],
      ),
    ).toEqual([]);
  });
  it('keeps a calculated fraction exact through conversion', () => {
    const point = {
      ...base,
      minValue: '17',
      maxValue: '17',
      maxValueEqual: true,
    };
    const ratio = {
      ...measurement,
      value: '1.699999999999999999',
      fraction: { numerator: '17', denominator: '10' },
    };
    expect(matchConvertedIntervals(ratio, [point], [4, 5], [rule])).toEqual([
      point,
    ]);
  });
  it('rejects ambiguous rules and unsupported input units', () => {
    expect(() =>
      matchConvertedIntervals(
        measurement,
        [base],
        [4, 5],
        [rule, { ...rule, id: 2 }],
      ),
    ).toThrow('ambiguous_conversion_rule');
    expect(() =>
      matchConvertedIntervals(measurement, [base], [5], [rule]),
    ).toThrow('source_unit_not_allowed');
  });
  it('never matches a disallowed target unit or a different demographic context', () => {
    expect(matchConvertedIntervals(measurement, [base], [4], [rule])).toEqual(
      [],
    );
    expect(
      matchConvertedIntervals(
        measurement,
        [{ ...base, ageId: 9 }],
        [4, 5],
        [rule],
      ),
    ).toEqual([]);
  });
});
