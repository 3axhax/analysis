import { measurePdfUnits, sumPdfUnitMetrics } from './pdf-unit-benchmark';
describe('explicit unit ID evaluation', () => {
  it('does not confuse another point unit, wrong value or null with a confirmed unit', () => {
    const expected = [
      { pointId: 1, name: 'A', value: 12, unit: 'g/l', unitId: 2 },
      { pointId: 2, name: 'B', value: 0, unit: null, unitId: null },
    ];
    expect(
      measurePdfUnits(expected, [
        { id: 1, value: 13, unitId: 2 },
        { id: 2, value: 0, unitId: null },
      ]),
    ).toMatchObject({
      expectedUnitRows: 1,
      correctUnitRows: 1,
      expectedTripleRows: 2,
      correctTripleRows: 1,
    });
    expect(
      measurePdfUnits(expected, [
        { id: 1, value: 12, unitId: null },
        { id: 3, value: 12, unitId: 2 },
      ]),
    ).toMatchObject({ correctUnitRows: 0, correctTripleRows: 0 });
  });
  it('preserves repeated expected rows and sums counts with empty sets', () => {
    const row = { pointId: 1, name: 'A', value: 12, unit: 'g/l', unitId: 2 };
    const result = measurePdfUnits(
      [row, row],
      [{ id: 1, value: 12, unitId: 2 }],
    );
    expect(result.correctTripleRows).toBe(2);
    expect(sumPdfUnitMetrics([measurePdfUnits([], []), result])).toEqual(
      result,
    );
  });
});
