import {
  resolveCorpusExpected,
  CorpusCatalogPoint,
} from './pdf-corpus-expected';

const point = (id: number): CorpusCatalogPoint => ({
  id,
  name: 'synthetic',
  parsingWords: 'colliding',
  translationRu: '',
  translationEn: '',
  parsingOrder: 0,
  units: [],
});
describe('explicit DB gold identities', () => {
  it('preserves zero, repeats and different values for the same id', () => {
    const rows = [0, 12, 12].map((value) => ({
      id: 7,
      name: 'Unrelated label',
      value,
      unit: null,
    }));
    expect(resolveCorpusExpected(rows, [point(7)])).toEqual({
      pairs: [0, 12, 12].map((value) => ({ pointId: 7, value })),
      issues: [],
    });
  });
  it('uses id even when names/aliases collide and units suggest another form', () => {
    expect(
      resolveCorpusExpected(
        [{ id: 2, name: 'colliding', value: 12, unit: '%' }],
        [point(1), point(2)],
      ),
    ).toEqual({ pairs: [{ pointId: 2, value: 12 }], issues: [] });
  });
  it('does not remap an obsolete id by name or current alias', () => {
    expect(
      resolveCorpusExpected(
        [{ id: 7, name: 'colliding', value: 12, unit: null }],
        [point(9)],
      ),
    ).toEqual({ pairs: [], issues: [{ row: 1, code: 'unknown_expected_id' }] });
  });
  it('reports invalid ids and nonnumeric values explicitly', () => {
    expect(
      resolveCorpusExpected(
        [
          { id: 0, name: 'A', value: 1, unit: null },
          { id: 1, name: 'A', value: 'negative', unit: null },
        ],
        [point(1)],
      ).issues,
    ).toEqual([
      { row: 1, code: 'invalid_expected_id' },
      { row: 2, code: 'nonnumeric_expected_value' },
    ]);
  });
  it('accepts empty gold', () => {
    expect(resolveCorpusExpected([], [point(1)])).toEqual({
      pairs: [],
      issues: [],
    });
  });
});
