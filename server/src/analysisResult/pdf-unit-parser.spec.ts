import { recognizePdfUnit } from './pdf-unit-parser';

describe('explicit result-adjacent unit recognition', () => {
  const allowed = [
    { id: 1, name: '%' },
    { id: 2, name: 'g/l' },
    { id: 3, name: '10^9/l' },
    { id: 4, name: 'µmol/l' },
  ];
  it.each(['г/л', 'g/L', 'г /\nл'])(
    'recognizes the same unit %s without changing a result',
    (text) => {
      expect(recognizePdfUnit(text, allowed)).toMatchObject({
        unitId: 2,
        unit: 'g/l',
      });
    },
  );
  it.each(['тыс/мкл', 'х10^9/л', '*10^9/л', '10⁹/л', '10 * 9 / л'])(
    'accepts numerically equivalent count notation %s',
    (text) => {
      expect(recognizePdfUnit(text, allowed).unitId).toBe(3);
    },
  );
  it('recognizes micro sign/Greek mu and split unit letters', () => {
    for (const text of ['мкмоль/л', 'µmol/l', 'μmol / L', 'мк моль / л'])
      expect(recognizePdfUnit(text, allowed).unitId).toBe(4);
  });
  it('distinguishes scales, does not convert or use another point units', () => {
    expect(recognizePdfUnit('g/dl', allowed)).toMatchObject({
      unitId: null,
      warning: 'unit_not_allowed',
    });
    expect(recognizePdfUnit('10^12/l', allowed).unitId).toBeNull();
  });
  it('never searches past reference text or guesses from a single allowed unit', () => {
    for (const text of [
      '',
      'Норма: 2 g/l',
      'референс g/l',
      'Другой показатель 12 g/l',
    ])
      expect(recognizePdfUnit(text, [allowed[1]]).unitId).toBeNull();
  });
  it('skips only result flags immediately before the adjacent unit', () => {
    expect(recognizePdfUnit('* %', allowed).unitId).toBe(1);
    expect(
      recognizePdfUnit('↑ млн/мкл', [{ id: 5, name: '10^12/l' }]).unitId,
    ).toBe(5);
  });
  it('rejects duplicate equivalent catalog identities and multiple adjacent units', () => {
    expect(
      recognizePdfUnit('г/л', [
        { id: 2, name: 'g/l' },
        { id: 9, name: 'г/л' },
      ]),
    ).toMatchObject({ unitId: null, warning: 'ambiguous_unit' });
    expect(recognizePdfUnit('g/l mg/dl', allowed)).toMatchObject({
      unitId: null,
      warning: 'ambiguous_unit',
    });
  });
});
