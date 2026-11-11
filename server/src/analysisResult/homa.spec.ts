import { calculateHoma } from './homa';

const point = (pointId: number, value: string, unitId: number) => ({ pointId, value, unitId });
describe('HOMA-IR calculation', () => {
  it('calculates the same index from both insulin units', () => {
    const a = calculateHoma([point(44, '5.4', 11), point(45, '10', 15)], 11, 15, 13);
    const b = calculateHoma([point(44, '5.4', 11), point(45, '10000', 13)], 11, 15, 13);
    expect(a?.ratio.toString()).toBe('2.4');
    expect(b?.ratio.toString()).toBe('2.4');
  });
  it.each(['2.699999', '2.7', '2.700001'])('preserves exact boundary %s', (value) => {
    const result = calculateHoma([point(44, '22.5', 11), point(45, value, 15)], 11, 15, 13);
    expect(result?.numerator.div(result.denominator).toString()).toBe(value);
  });
  it('rejects missing, duplicated, wrong-unit and invalid input', () => {
    const g = point(44, '5', 11), i = point(45, '10', 15);
    expect(calculateHoma([g], 11, 15, 13)).toBeNull();
    expect(calculateHoma([g, g, i], 11, 15, 13)).toBeNull();
    expect(calculateHoma([point(44, '5', 5), i], 11, 15, 13)).toBeNull();
    expect(calculateHoma([g, point(45, '-1', 15)], 11, 15, 13)).toBeNull();
    expect(calculateHoma([g, point(45, 'nan', 15)], 11, 15, 13)).toBeNull();
  });
  it('accepts zero as a valid measurement', () => {
    expect(calculateHoma([point(44, '0', 11), point(45, '10', 15)], 11, 15, 13)?.ratio.toString()).toBe('0');
  });
});
