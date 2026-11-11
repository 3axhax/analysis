import { calculateDeRitis } from './de-ritis';

describe('de Ritis calculation', () => {
  const point = (pointId: number, value: number | string, unitId = 12) => ({ pointId, value, unitId });
  it('uses AST divided by ALT with the source values', () => {
    const result = calculateDeRitis([{ ...point(32, 99), sourceValue: '20', sourceUnitId: 12 }, point(33, '30')], 12);
    expect(result?.ratio.toString()).toBe('1.5');
  });
  it('accepts zero AST', () => {
    expect(calculateDeRitis([point(32, 20), point(33, 0)], 12)?.ratio.toString()).toBe('0');
  });
  it.each([
    [[], 'missing'],
    [[point(32, 20)], 'missing AST'],
    [[point(32, 0), point(33, 20)], 'zero ALT'],
    [[point(32, 20), point(33, 20, 2)], 'unit mismatch'],
    [[point(32, 20), point(32, 30), point(33, 20)], 'duplicate'],
    [[point(32, 20), point(33, -1)], 'negative'],
  ])('does not calculate for %s (%s)', (points) => {
    expect(calculateDeRitis(points as ReturnType<typeof point>[], 12)).toBeNull();
  });
  it('keeps sufficient precision near status boundaries', () => {
    const x = calculateDeRitis([point(32, '100000000000000000'), point(33, '175000000000000001')], 12)!;
    expect(x.numerator.gt(x.denominator.times('1.75'))).toBe(true);
  });
});
