import { measurePdfPairs } from './pdf-pair-benchmark';

describe('pair benchmark', () => {
  it('keeps different values of one point and counts duplicate pairs once', () => {
    expect(
      measurePdfPairs(
        [
          { pointId: 1, value: 2 },
          { pointId: 1, value: 3 },
          { pointId: 1, value: 2 },
        ],
        [
          { id: 1, value: 2 },
          { id: 1, value: 2 },
        ],
      ),
    ).toMatchObject({
      expectedPoints: 1,
      expectedRows: 3,
      correctRows: 2,
      expectedPairs: 2,
      foundPairs: 1,
      correctPairs: 1,
      duplicateExpectedRows: 1,
    });
  });
  it('separates wrong values and extra points with exact numeric equality', () => {
    expect(
      measurePdfPairs(
        [{ pointId: 1, value: 2 }],
        [
          { id: 1, value: 2.000000001 },
          { id: 9, value: 2 },
        ],
      ),
    ).toMatchObject({
      correctPoints: 1,
      correctPairs: 0,
      wrongValues: 1,
      extraPoints: 1,
    });
  });
  it('supports empty expected and actual sets', () => {
    expect(measurePdfPairs([], [])).toMatchObject({
      expectedPoints: 0,
      foundPairs: 0,
      correctPairs: 0,
    });
  });
});
