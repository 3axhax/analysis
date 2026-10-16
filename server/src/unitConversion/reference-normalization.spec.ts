import {
  normalizeToReference,
  NormalizationInput,
  UnitNormalizationError,
} from './reference-normalization';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
const setup = (): NormalizationInput => ({
  pointId: 1,
  ageId: 2,
  genderId: 1,
  sourceUnitId: 16,
  sourceValue: '12',
  allowedUnitIds: [2, 16],
  minimums: [{ pointId: 1, ageId: 2, genderId: 1, unitId: 2, value: '120' }],
  maximums: [{ pointId: 1, ageId: 2, genderId: 1, unitId: 2, value: '160' }],
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
const failure = (input: NormalizationInput, code: string) =>
  expect(() => normalizeToReference(input)).toThrow(
    new UnitNormalizationError(code),
  );
describe('reference-specific unit normalization', () => {
  it('keeps distinct source and target units and rule provenance for coefficient one', () => {
    const input = setup();
    input.rules[0].coefficient = '1';
    expect(normalizeToReference(input)).toMatchObject({
      sourceUnitId: 16,
      calculationUnitId: 2,
      sourceValue: '12',
      calculationValue: '12',
      appliedCoefficient: '1',
      conversionRuleId: 1,
      conversionRuleVersion: 1,
      status: StatusValue.LOW,
      displayMin: '120',
      displayMax: '160',
    });
  });
  it.each([
    ['11.999999999999999999', StatusValue.LOW],
    ['12', StatusValue.NORMAL],
    ['16', StatusValue.NORMAL],
    ['16.000000000000000001', StatusValue.HIGH],
  ])('compares exact decimal boundary %s', (value, status) => {
    const result = normalizeToReference({ ...setup(), sourceValue: value });
    expect(result.status).toBe(status);
    expect(result.displayMin).toBe('12');
    expect(result.displayMax).toBe('16');
    expect(result.sourceUnitId).toBe(16);
    expect(result.appliedCoefficient).toBe('10');
  });
  it('keeps source, calculation and rule version separate', () => {
    expect(normalizeToReference(setup())).toMatchObject({
      sourceValue: '12',
      calculationValue: '120',
      calculationUnitId: 2,
      conversionRuleId: 1,
      conversionRuleVersion: 1,
    });
  });
  it('prioritizes an exact unit without consulting unrelated conflicting ranges', () => {
    const input = setup();
    input.minimums.push({ ...input.minimums[0], unitId: 16, value: 13 });
    input.maximums.push({ ...input.maximums[0], unitId: 16, value: 17 });
    expect(normalizeToReference(input)).toMatchObject({
      calculationUnitId: 16,
      appliedCoefficient: '1',
      conversionRuleId: null,
      status: StatusValue.LOW,
    });
  });
  it('selects only the specified point/age/gender, not another available context', () => {
    const input = setup();
    input.minimums.push({ ...input.minimums[0], ageId: 3, value: 0 });
    input.maximums.push({ ...input.maximums[0], genderId: 2, value: 0 });
    expect(normalizeToReference(input).calculationValue).toBe('120');
    failure({ ...input, ageId: 99 }, 'no_convertible_reference_range');
  });
  it('accepts equal convertible intervals deterministically, rejects different ones', () => {
    const input = setup();
    input.allowedUnitIds.push(3);
    input.minimums.push({ ...input.minimums[0], unitId: 3, value: 1200 });
    input.maximums.push({ ...input.maximums[0], unitId: 3, value: 1600 });
    input.rules.push({
      ...input.rules[0],
      id: 2,
      toUnitId: 3,
      coefficient: '100',
    });
    expect(normalizeToReference(input).calculationUnitId).toBe(2);
    input.maximums[1].value = 1601;
    failure(input, 'conflicting_reference_ranges');
  });
  it('does not compare rounded inverse limits to detect equality', () => {
    const input = setup();
    input.rules[0].coefficient = '3';
    input.minimums[0].value = '1';
    input.maximums[0].value = '2';
    expect(normalizeToReference(input).displayMin).toBe(
      '0.33333333333333333333',
    );
  });
  it.each([
    '0',
    '-10',
    'NaN',
    'Infinity',
    '0x10',
    '1e999',
    '0.0000000000000000001',
  ])('rejects invalid coefficient %s', (coefficient) => {
    const input = setup();
    input.rules[0].coefficient = coefficient;
    failure(input, 'invalid_conversion_coefficient');
  });
  it.each([-1, NaN, Infinity, '0x10', '1e999'])(
    'rejects invalid source %s',
    (sourceValue) =>
      failure({ ...setup(), sourceValue }, 'invalid_source_value'),
  );
  it('supports zero, decimal comma and exact identity arithmetic', () => {
    expect(
      normalizeToReference({ ...setup(), sourceValue: 0 }).calculationValue,
    ).toBe('0');
    expect(
      normalizeToReference({ ...setup(), sourceValue: '12,3' })
        .calculationValue,
    ).toBe('123');
    expect(
      normalizeToReference({ ...setup(), sourceUnitId: 2, sourceValue: 120 })
        .status,
    ).toBe(StatusValue.NORMAL);
  });
  it('does not use absent, inactive, other-point or multi-hop rules', () => {
    const input = setup();
    input.rules[0].pointId = 2;
    failure(input, 'no_convertible_reference_range');
    input.rules[0].pointId = null;
    input.rules[0].active = false;
    failure(input, 'no_convertible_reference_range');
    failure({ ...setup(), allowedUnitIds: [2] }, 'source_unit_not_allowed');
  });
  it('rejects ambiguous active conversion rules even if coefficients match', () => {
    const input = setup();
    input.rules.push({ ...input.rules[0], id: 2, version: 2 });
    failure(input, 'ambiguous_conversion_rule');
  });
  it('never falls back from an invalid exact interval to another unit', () => {
    const input = setup();
    input.minimums.push({ ...input.minimums[0], unitId: 16, value: 12 });
    failure(input, 'incomplete_or_duplicate_reference_range');
  });
  it('rejects duplicate bounds and reversed ranges', () => {
    const input = setup();
    input.minimums.push({ ...input.minimums[0] });
    failure(input, 'incomplete_or_duplicate_reference_range');
    input.minimums.pop();
    input.maximums[0].value = 0;
    failure(input, 'reversed_reference_range');
  });
});
