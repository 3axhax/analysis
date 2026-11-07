import { normalizeSourceReference } from './source-reference-normalization';
import { NormalizationInput } from './reference-normalization';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
const input = (): NormalizationInput => ({
  pointId: 1,
  ageId: 2,
  genderId: 1,
  sourceUnitId: 16,
  sourceValue: '3',
  allowedUnitIds: [2, 16],
  minimums: [{ pointId: 1, ageId: 2, genderId: 1, unitId: 2, value: '30' }],
  maximums: [],
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
});
describe('source reference bounds', () => {
  it.each([
    ['2.999', StatusValue.LOW],
    ['3', StatusValue.NORMAL],
    ['3.001', StatusValue.NORMAL],
  ])('lower threshold and conversion %s', (value, status) => {
    expect(
      normalizeSourceReference({ ...input(), sourceValue: value }),
    ).toMatchObject({ status, displayMin: '3', displayMax: null });
  });
  it.each([
    ['2.999', StatusValue.NORMAL],
    ['3', StatusValue.NORMAL],
    ['3.001', StatusValue.HIGH],
  ])('upper threshold and conversion %s', (value, status) => {
    const x = input();
    x.maximums = x.minimums;
    x.minimums = [];
    x.sourceValue = value;
    expect(normalizeSourceReference(x)).toMatchObject({
      status,
      displayMin: null,
      displayMax: '3',
    });
  });
  it('rejects duplicate thresholds', () => {
    const x = input();
    x.minimums.push(x.minimums[0]);
    expect(() => normalizeSourceReference(x)).toThrow(
      'incomplete_or_duplicate_reference_range',
    );
  });
  it.each([
    ['2.999', StatusValue.LOW],
    ['3', StatusValue.LOW],
    ['3.001', StatusValue.NORMAL],
  ])('inclusive lower threshold after conversion %s', (value, status) => {
    const x = input();
    x.minimums[0].lowInclusive = true;
    x.sourceValue = value;
    expect(normalizeSourceReference(x).status).toBe(status);
  });
});
