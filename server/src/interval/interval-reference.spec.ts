import { commonReference } from './interval-reference';
import { IntervalInput, SourcedInterval } from './interval-evaluator';

const input: IntervalInput = {
  measurement: { pointId: 1, ageId: 2, genderId: 3, unitId: 4, value: '12' },
  allowedUnitIds: [4, 5],
  rules: [],
};
const reference: SourcedInterval = {
  id: 1,
  pointId: 1,
  ageId: 2,
  genderId: 3,
  unitId: 4,
  sourceId: null,
  status: 'NORMAL',
  minValue: '2',
  maxValue: '10',
  minValueEqual: true,
  maxValueEqual: true,
};
describe('common reference display', () => {
  it('returns both bounds even when the measurement is outside them', () => {
    expect(commonReference(input, [reference])).toMatchObject({
      displayMin: '2',
      displayMax: '10',
    });
  });
  it('ignores source-specific and incomplete intervals', () => {
    expect(commonReference(input, [{ ...reference, sourceId: 8 }])).toBeNull();
    expect(
      commonReference(input, [
        { ...reference, maxValue: null, maxValueEqual: null },
      ]),
    ).toBeNull();
  });
  it('converts bounds to the input unit when a valid rule exists', () => {
    const converted = {
      ...reference,
      unitId: 5,
      minValue: '20',
      maxValue: '100',
    };
    const rule = {
      id: 1,
      version: 1,
      active: true,
      pointId: null,
      fromUnitId: 4,
      toUnitId: 5,
      coefficient: '10',
    };
    expect(
      commonReference({ ...input, rules: [rule] }, [converted]),
    ).toMatchObject({ displayMin: '2', displayMax: '10' });
  });
  it('does not select an ambiguous reference', () => {
    expect(
      commonReference(input, [
        reference,
        { ...reference, id: 2, maxValue: '11' },
      ]),
    ).toBeNull();
  });
});
