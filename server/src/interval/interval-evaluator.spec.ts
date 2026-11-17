import { evaluateIntervals, SourcedInterval } from './interval-evaluator';
import { IntervalInput } from './interval-evaluator';

const input: IntervalInput = {
  measurement: { pointId: 1, ageId: 2, genderId: 3, unitId: 4, value: '5' },
  allowedUnitIds: [4, 5],
  rules: [],
};
const a: SourcedInterval = {
  id: 1,
  pointId: 1,
  ageId: 2,
  genderId: 3,
  unitId: 4,
  sourceId: 10,
  status: null,
  minValue: '5',
  maxValue: null,
  minValueEqual: true,
  maxValueEqual: null,
};
describe('interval evaluation', () => {
  it('uses other-source and status-free intervals to match descriptions', () => {
    const descriptions = [
      {
        id: 8,
        sourceId: 20,
        conditions: [{ pointId: 1, intervalIds: [1, 2] }],
      },
    ];
    const result = evaluateIntervals(
      [input],
      [a, { ...a, id: 2, sourceId: 30, status: 'NORMAL' }],
      descriptions,
    );
    expect(result.intervals.map((item) => item.id)).toEqual([1, 2]);
    expect(result.descriptions.map((item) => item.id)).toEqual([8]);
  });
  it('continues matching other intervals after an ambiguous conversion', () => {
    const rule = {
      id: 1,
      version: 1,
      fromUnitId: 4,
      toUnitId: 5,
      coefficient: '10',
      active: true,
      pointId: null,
    };
    const result = evaluateIntervals(
      [{ ...input, rules: [rule, { ...rule, id: 2 }] }],
      [a, { ...a, id: 2, unitId: 5 }],
      [],
    );
    expect(result.intervals.map((item) => item.id)).toEqual([1]);
    expect(result.warnings).toEqual([
      { pointId: 1, intervalId: 2, code: 'ambiguous_conversion_rule' },
    ]);
  });
  it('requires all conditions and a matching measurement for each', () => {
    const descriptions = [
      {
        id: 8,
        sourceId: null,
        conditions: [
          { pointId: 1, intervalIds: [1] },
          { pointId: 9, intervalIds: [3] },
        ],
      },
    ];
    expect(evaluateIntervals([input], [a], descriptions).descriptions).toEqual(
      [],
    );
    const b = { ...a, id: 3, pointId: 9 };
    expect(
      evaluateIntervals(
        [
          input,
          { ...input, measurement: { ...input.measurement, pointId: 9 } },
        ],
        [a, b],
        descriptions,
      ).descriptions,
    ).toEqual(descriptions);
  });
});
