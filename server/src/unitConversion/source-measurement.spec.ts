import { sourceMeasurementValue } from './reference-normalization';

describe('source measurement storage validation without reference lookup', () => {
  it.each([
    [0, '0'],
    ['0,25', '0.25'],
    ['123.123456789123456789', '123.123456789123456789'],
    [3000, '3000'],
  ])(
    'preserves numeric input %s without requiring norms',
    (value, expected) => {
      expect(sourceMeasurementValue(value)).toBe(expected);
    },
  );
  it.each([
    null,
    undefined,
    {},
    true,
    -1,
    '-0.1',
    NaN,
    Infinity,
    'NaN',
    '1e20',
  ])('rejects malformed source value without silently dropping it', (value) =>
    expect(() => sourceMeasurementValue(value)).toThrow('invalid_source_value'),
  );
});
