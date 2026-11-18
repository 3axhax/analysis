import { evaluateIntervals, SourcedInterval } from './interval-evaluator';

describe('thyroid descriptions linked to common intervals', () => {
  it.each([['FT3', '3.1', '6.8'], ['FT4', '10.8', '22']])(
    '%s matches exact boundaries and converted units for both sexes',
    (_name, low, high) => {
      for (const genderId of [1, 2]) {
        const base = { pointId: 1, ageId: 1, genderId, unitId: 10, sourceId: null };
        const intervals: SourcedInterval[] = [
          { ...base, id: 1, minValue: null, maxValue: low, minValueEqual: null, maxValueEqual: false, status: 'LOW' },
          { ...base, id: 2, minValue: low, maxValue: high, minValueEqual: true, maxValueEqual: true, status: 'NORMAL' },
          { ...base, id: 3, minValue: high, maxValue: null, minValueEqual: false, maxValueEqual: null, status: 'HIGH' },
        ];
        const descriptions = intervals.map((interval) => ({ id: interval.id, sourceId: 20, conditions: [{ pointId: 1, intervalIds: [interval.id] }] }));
        for (const [value, expected] of [[Number(low) - .001, 1], [Number(low), 2], [Number(high), 2], [Number(high) + .001, 3]] as const) {
          for (const unitId of [10, 11]) {
            const sourceValue = unitId === 10 ? value.toFixed(3) : (value / 1_000_000).toFixed(9);
            const result = evaluateIntervals([{ measurement: { pointId: 1, ageId: 1, genderId, unitId, value: sourceValue }, allowedUnitIds: [10, 11], rules: [{ id: 1, fromUnitId: 11, toUnitId: 10, coefficient: '1000000', version: 1, active: true, pointId: 1 }] }], intervals, descriptions);
            expect(result.descriptions.map((description) => description.id)).toEqual([expected]);
          }
        }
      }
    },
  );
});
