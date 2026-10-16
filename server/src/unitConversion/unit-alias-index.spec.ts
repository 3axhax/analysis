import { UnitAliasIndex, unitSpellingKey } from './unit-alias-index';
describe('DB translationParsing unit index', () => {
  const catalog = [
    { id: 1, name: 'g/l', code: 'g/L', translationParsing: 'г/л_g/l' },
    {
      id: 2,
      name: 'g/dl',
      code: 'g/dL',
      translationParsing: 'г/дл_g/dl_г/100мл',
    },
  ];
  it('uses DB aliases without merging different source units', () => {
    const index = new UnitAliasIndex(catalog);
    expect(index.resolve('г / дл', [1, 2]).unit?.id).toBe(2);
    expect(index.resolve('g/L', [1, 2]).unit?.id).toBe(1);
    expect(index.resolve('g/dl', [1]).warning).toBe('unit_not_allowed');
  });
  it('recognizes only an adjacent prefix and preserves the source spelling', () => {
    const index = new UnitAliasIndex(catalog);
    expect(index.recognizePrefix(' г / дл reference 10', [1, 2])).toMatchObject(
      { unitId: 2, unitText: 'г / дл' },
    );
    expect(index.recognizePrefix('Норма: г/дл', [1, 2])).toMatchObject({
      unitId: null,
      warning: 'unit_not_found',
    });
    expect(index.recognizePrefix('g/l g/dl', [1, 2])).toMatchObject({
      unitId: null,
      warning: 'ambiguous_unit',
    });
  });
  it('preserves meaningful prefix case', () => {
    const index = new UnitAliasIndex([
      { id: 1, name: 'mU/L', translationParsing: '' },
      { id: 2, name: 'MU/L', translationParsing: '' },
    ]);
    expect(index.resolve('mU/L', [1, 2]).unit?.id).toBe(1);
    expect(index.resolve('MU/L', [1, 2]).unit?.id).toBe(2);
    expect(index.resolve('mu/l', [1, 2]).warning).toBe('unit_not_found');
  });
  it('does not guess a global collision even if the point allows one unit', () => {
    const index = new UnitAliasIndex([
      ...catalog,
      { id: 3, name: 'different', translationParsing: 'г/л' },
    ]);
    expect(index.resolve('г/л', [1]).warning).toBe('ambiguous_unit');
    expect(index.issues.some((i) => i.code === 'colliding_unit_alias')).toBe(
      true,
    );
  });
  it('reports malformed/duplicate spellings and normalizes only safe Unicode', () => {
    const index = new UnitAliasIndex([
      { id: 1, name: 'ug/L', translationParsing: 'мкг/л__мк г/л' },
    ]);
    expect(index.issues.map((i) => i.code)).toEqual([
      'empty_unit_alias',
      'duplicate_unit_alias',
    ]);
    expect(unitSpellingKey('10⁹ / л')).toBe('10^9/л');
    expect(unitSpellingKey('µg/L')).toBe(unitSpellingKey('μg/L'));
  });
});
