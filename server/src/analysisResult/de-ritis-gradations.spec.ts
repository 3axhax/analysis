import Decimal from 'decimal.js';
import { DE_RITIS_RULES, matchesDeRitisRule } from './de-ritis-gradations';

const D = Decimal.clone({ precision: 80 });
function matched(numerator: string, denominator = '1') {
  const ratio = { numerator: new D(numerator), denominator: new D(denominator) };
  return Object.keys(DE_RITIS_RULES).filter((key) => matchesDeRitisRule(key, ratio)).sort();
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
  it('rejects invalid rules and invalid measurements', () => {
    expect(matchesDeRitisRule('other', { numerator: new D(2), denominator: new D(1) })).toBe(false);
    expect(matchesDeRitisRule('gte_2', { numerator: new D(2), denominator: new D(0) })).toBe(false);
    expect(matchesDeRitisRule('lt_1', { numerator: new D(-1), denominator: new D(2) })).toBe(false);
  });
});
