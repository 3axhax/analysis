import { matchesInterval } from '../interval/interval-matcher';

const limits: Record<string, [string | null, string | null, boolean | null, boolean | null]> = {
  gte_2: ['2', null, true, null], gte_1_7: ['1.7', null, true, null],
  eq_1_5: ['1.7', '1.7', true, true], eq_1: ['1', '1', true, true],
  lt_1: [null, '1', null, false], lt_1_5: [null, '1.5', null, false],
};
function matched(numerator: string, denominator = '1') {
  return Object.entries(limits).filter(([, [minValue, maxValue, minValueEqual, maxValueEqual]], index) => matchesInterval(
    { id: index + 1, pointId: 99, ageId: 1, genderId: 1, unitId: 1, minValue, maxValue, minValueEqual, maxValueEqual },
    { pointId: 99, ageIds: [1], genderId: 1, unitId: 1, value: numerator, fraction: { numerator, denominator } },
  )).map(([key]) => key).sort();
}
describe('independent de Ritis gradations', () => {
  it.each([
    ['0', ['lt_1', 'lt_1_5']],
    ['0.909999', ['lt_1', 'lt_1_5']],
    ['0.91', ['lt_1', 'lt_1_5']],
    ['0.999999', ['lt_1', 'lt_1_5']],
    ['1', ['eq_1', 'lt_1_5']],
    ['1.000001', ['lt_1_5']],
    ['1.499999', ['lt_1_5']],
    ['1.5', []],
    ['1.500001', []],
    ['1.699999', []],
    ['1.7', ['eq_1_5', 'gte_1_7']],
    ['1.700001', ['gte_1_7']],
    ['1.75', ['gte_1_7']],
    ['1.750001', ['gte_1_7']],
    ['1.999999', ['gte_1_7']],
    ['2', ['gte_1_7', 'gte_2']],
    ['2.000001', ['gte_1_7', 'gte_2']],
  ])('checks every overlapping rule at %s', (value, expected) => {
    expect(matched(value)).toEqual(expected.sort());
  });
  it('compares cross products instead of rounded quotient', () => {
    expect(matched('169999999999999999', '100000000000000000')).toEqual([]);
    expect(matched('200000000000000001', '100000000000000000')).toEqual(['gte_1_7', 'gte_2']);
    expect(matched('17', '10')).toEqual(['eq_1_5', 'gte_1_7']);
  });
});
