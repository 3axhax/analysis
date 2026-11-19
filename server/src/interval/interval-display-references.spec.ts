import { displayReferences } from './interval-display-references';
import { IntervalInput, SourcedInterval } from './interval-evaluator';
const input: IntervalInput = {
  measurement: { pointId: 1, ageIds: [2], genderId: 3, unitId: 4, value: '100' },
  allowedUnitIds: [4, 5],
  rules: [
    {
      id: 1,
      version: 1,
      active: true,
      pointId: null,
      fromUnitId: 4,
      toUnitId: 5,
      coefficient: '10',
    },
  ],
};
const base: SourcedInterval = {
  id: 1,
  pointId: 1,
  ageId: 2,
  genderId: 3,
  unitId: 5,
  sourceId: 7,
  status: 'NORMAL',
  minValue: '20',
  maxValue: '100',
  minValueEqual: false,
  maxValueEqual: true,
};
describe('display references', () => {
  it('returns a converted interval even when the measurement does not match', () => {
    expect(displayReferences(input, [base])).toMatchObject([
      { minValue: '2', maxValue: '10', minValueEqual: false, unitId: 4 },
    ]);
  });
  it('prefers exact units separately for each document and status', () => {
    const exact = { ...base, id: 2, unitId: 4, minValue: '3' };
    const optimum = { ...base, id: 3, status: 'OPTIMUM' as const };
    const otherSource = { ...base, id: 4, sourceId: 8 };
    expect(
      displayReferences(input, [base, exact, optimum, otherSource]).map(
        (i) => i.id,
      ),
    ).toEqual([2, 3, 4]);
  });
  it('does not infer ambiguous or missing conversions, or use another age or sex', () => {
    expect(displayReferences({ ...input, rules: [] }, [base])).toEqual([]);
    expect(
      displayReferences(
        { ...input, rules: [...input.rules, { ...input.rules[0], id: 2 }] },
        [base],
      ),
    ).toEqual([]);
    expect(
      displayReferences(input, [
        { ...base, ageId: 9 },
        { ...base, genderId: 9 },
      ]),
    ).toEqual([]);
  });
  it('marks a recurring converted boundary as approximate', () => {
    const rule = { ...input.rules[0], coefficient: '3' };
    expect(
      displayReferences({ ...input, rules: [rule] }, [
        { ...base, minValue: '1', maxValue: '3' },
      ]),
    ).toMatchObject([{ minApproximate: true, maxApproximate: false }]);
  });
  it('does not repeat identical intervals within the same document and status', () => {
    expect(
      displayReferences(input, [base, { ...base, id: 9, minValue: '20.000' }]),
    ).toHaveLength(1);
  });
});
