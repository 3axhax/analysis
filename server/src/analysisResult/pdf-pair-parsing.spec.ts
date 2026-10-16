import { PdfNameIndex, canonicalName } from './pdf-name-index';
import { rowEvidence } from './pdf-row-evidence';
import {
  headerColumns,
  inferResultColumns,
  resultRegion,
} from './pdf-result-region';
import { numericTokens, parseResult } from './pdf-value-parser';
import { resolvePdfPairs } from './pdf-pair-resolver';

const point = (id: number, parsingWords: string, name = `point${id}`) => ({
  id,
  name,
  parsingWords,
  parsingOrder: 0,
  translationRu: '',
  translationEn: '',
  units: [],
});
const row = (cells: string[]) =>
  rowEvidence(cells, { page: 1, table: 0, row: 0, method: 'text' });

describe('deterministic name and value parsing', () => {
  it.each(['12', '0', '0,5'])(
    'isolates scalar %s with unit before demographic references in a ruled grid',
    (value) => {
      const evidence = rowEvidence(
        ['ABC', `${value} мм/ч`, 'Мужчины (до 45 лет) 1 18'],
        { page: 1, table: 0, row: 0, method: 'lines' },
      );
      const region = resultRegion(evidence, 3);
      expect(region.rule).toBe('separate_result_unit_cell');
      expect(parseResult(region.text).value).toBe(
        Number(value.replace(',', '.')),
      );
      expect(
        evidence.text.slice(region.start, region.start + region.text.length),
      ).toBe(region.text);
    },
  );
  it.each([
    '12 15 мм/ч',
    '< 12 мм/ч',
    '- 12 мм/ч',
    '3000 мм/ч',
    'метод 12 мм/ч',
    '12 произвольный',
  ])('does not isolate unsafe result cell %s', (cell) => {
    const evidence = rowEvidence(['ABC', cell, 'Мужчины (до 45 лет) 1 18'], {
      page: 1,
      table: 0,
      row: 0,
      method: 'lines',
    });
    expect(parseResult(resultRegion(evidence, 3).text).value).toBeUndefined();
  });
  it('does not treat text-strategy cuts or another result as a reference cell', () => {
    expect(
      parseResult(
        resultRegion(row(['ABC', '12 мм/ч', 'Мужчины (до 45 лет) 1 18']), 3)
          .text,
      ).value,
    ).toBeUndefined();
    const evidence = rowEvidence(['ABC', '12 мм/ч', 'Другой показатель 27'], {
      page: 1,
      table: 0,
      row: 0,
      method: 'lines',
    });
    expect(parseResult(resultRegion(evidence, 3).text).value).toBeUndefined();
  });
  it('uses the catalog CV phrase, not a generic erythrocyte width as an alias', () => {
    const index = new PdfNameIndex([
      point(1, 'RDW_Точность ширины распределения эритроцитов', 'rdw'),
    ]);
    expect(
      index.select('Точность ширины распределения эритроцитов 12 %').matches[0],
    ).toMatchObject({ point: { id: 1 }, variant: 'cv' });
    expect(
      index.select('Ширина распределения эритроцитов 42 фл').matches,
    ).toEqual([]);
    expect(
      new PdfNameIndex([point(1, 'RDW', 'rdw')]).select(
        'Точность ширины распределения эритроцитов 12 %',
      ).matches,
    ).toEqual([]);
  });
  it('maps RDW and RDW-CV to CV and excludes unsupported SD even with generic aliases', () => {
    const index = new PdfNameIndex([
      point(1, 'RDW_RDW-SD_Распределение эритроцитов по объему', 'rdw'),
    ]);
    expect(index.select('RDW 12').matches[0]).toMatchObject({
      variant: 'cv',
      point: { id: 1 },
    });
    expect(index.select('RDW-CV 12').matches[0]).toMatchObject({
      variant: 'cv',
      point: { id: 1 },
    });
    expect(
      index.select('RDW-SD Распределение эритроцитов по объему 12'),
    ).toMatchObject({ matches: [], unsupported: true });
    expect(index.select('RDW – SD 12').matches).toEqual([]);
    expect(
      index.select('RDW-CV 12 reference RDW-SD 20').matches[0]?.variant,
    ).toBe('cv');
  });
  it.each(['0', '0.0', '0,0'])('accepts a scalar zero %s', (text) => {
    expect(parseResult(text)).toEqual({ value: 0 });
  });
  it('does not take zero from unrelated method prose', () => {
    expect(parseResult('метод исследования 0').value).toBeUndefined();
  });
  it('handles abbreviation punctuation and preserves decimal-point values and source offsets', () => {
    for (const text of ['ABC. 0 тыс/мкл < 1', 'ABC, 0 % < 1', 'ABC 0 % < 1']) {
      const evidence = row([text]);
      const region = resultRegion(evidence, 3);
      expect(parseResult(region.text)).toEqual({ value: 0 });
      const token = numericTokens(region.text)[0];
      expect(
        evidence.text.slice(
          region.start + token.start,
          region.start + token.end,
        ),
      ).toBe('0');
    }
    expect(parseResult(resultRegion(row(['ABC .5 мм/ч < 1']), 3).text)).toEqual(
      { value: 0.5 },
    );
    expect(
      parseResult(resultRegion(row(['ABC. - 1 мм/ч < 2']), 3).text).value,
    ).toBeUndefined();
  });
  it('separates a simple named result/unit from a reference comparison or range', () => {
    for (const tail of ['12 мм/ч < 20', '12,5 мг/л 2–20', '12 % ≤ 20']) {
      const region = resultRegion(row(['ABC ' + tail]), 3);
      expect(parseResult(region.text).value).toBe(
        tail.startsWith('12,') ? 12.5 : 12,
      );
      expect(region.rule).toBe('simple_named_result_unit_reference');
    }
  });
  it('does not select a first number from multiple results, prose, or a comparison result', () => {
    for (const tail of [
      '12 мм/ч 20',
      '12 произвольный текст < 20',
      '< 12 мм/ч < 20',
      '- 12 мм/ч < 20',
    ]) {
      expect(
        parseResult(resultRegion(row(['ABC ' + tail]), 3).text).value,
      ).toBeUndefined();
    }
  });
  it('classifies neutrophil forms without guessing from a generic name or references', () => {
    const index = new PdfNameIndex([
      point(1, 'Нейтрофилы_число нейтрофилов_NE', 'neutrophil-count'),
      point(2, 'NEU%', 'neutrophil-percentage'),
    ]);
    expect(
      index.select('Нейтрофилы (общ.число), 12 %').matches[0]?.point.id,
    ).toBe(2);
    expect(index.select('Нейтрофилы, абс. 12').matches[0]?.point.id).toBe(1);
    expect(index.select('Нейтрофилы # 12').matches[0]?.point.id).toBe(1);
    expect(index.select('число нейтрофилов 12').matches[0]?.point.id).toBe(1);
    expect(index.select('Нейтрофилы 12').ambiguous).toBe(true);
    expect(index.select('Нейтрофилы, абс. % 12').ambiguous).toBe(true);
    expect(index.select('Нейтрофилы 12 референс 20 %').ambiguous).toBe(true);
  });
  it('uses exact catalog aliases and form markers generically for unrelated analytes', () => {
    const index = new PdfNameIndex([
      point(1, 'Синтеты_ZZ_ZZ#_Синтеты, абс.', 'synthetic-count'),
      point(2, 'ZZ%_Процент синтетов_Синтеты, %', 'synthetic-percentage'),
    ]);
    expect(index.select('Синтеты (ZZ) 12').matches[0]?.point.id).toBe(1);
    expect(index.select('Синтеты (общ.число) 12 %').matches[0]?.point.id).toBe(
      2,
    );
    expect(index.select('Синтеты, абс. 12').matches[0]?.point.id).toBe(1);
    expect(index.select('ZZ% 12').matches[0]?.point.id).toBe(2);
    expect(index.select('ZZ# 12').matches[0]?.point.id).toBe(1);
    expect(index.select('Синтеты 12').ambiguous).toBe(true);
    expect(index.select('Синтеты ZZ 12 %').ambiguous).toBe(true);
    expect(index.select('Синтеты, абс. % 12').ambiguous).toBe(true);
    expect(index.select('Синтеты 12 референс 20 %').ambiguous).toBe(true);
    expect(index.select('ZZ 12 reference ZZ% 20').matches[0]?.point.id).toBe(1);
  });
  it('does not remap unsupported catalog forms', () => {
    const index = new PdfNameIndex([point(1, 'Синтеты_ZZ', 'synthetic-count')]);
    expect(index.select('Синтеты 12 %')).toMatchObject({
      matches: [],
      unsupported: true,
    });
  });
  it('does not collapse fragmented clinical subtypes into a supported generic family', () => {
    const index = new PdfNameIndex([
      point(1, 'Нейтрофилы_NE', 'neutrophil-count'),
      point(2, 'NE%', 'neutrophil-percentage'),
    ]);
    for (const text of [
      'Юн ые нейтро филы 12 %',
      'Палочко ядер ные нейтро филы 12 %',
      'Сегменто ядерные нейтрофилы 12 %',
    ])
      expect(index.select(text).matches).toEqual([]);
  });
  it('preserves analyte suffixes but treats a standalone dash as a separator', () => {
    expect(canonicalName('ABC — название ABC-CV ABC-SD ABC% ABC#')).toBe(
      'abc название abc-cv abc-sd abc% abc#',
    );
  });
  it('matches across cells and exact letter fragments and uses translations with explicit aliases', () => {
    const index = new PdfNameIndex([
      { ...point(1, 'ABC'), translationRu: 'Синтетический маркер' },
    ]);
    expect(
      index.select('\nСинтетический\nмар\nкер\n12.5').matches[0]?.point.id,
    ).toBe(1);
  });
  it('reports a shared code as ambiguous', () => {
    expect(
      new PdfNameIndex([point(1, 'ABC'), point(2, 'ABC')]).select('ABC 12.5'),
    ).toMatchObject({ ambiguous: true, matches: [] });
  });
  it('does not collapse count and percentage codes', () => {
    const index = new PdfNameIndex([point(1, 'XYZ#'), point(2, 'XYZ%')]);
    expect(index.select('XYZ# 12.5').matches[0]?.point.id).toBe(1);
    expect(index.select('XYZ% 12.5').matches[0]?.point.id).toBe(2);
  });
  it('gets a named variant from the matched name rather than reference prose', () => {
    const index = new PdfNameIndex([point(1, 'RDW-CV_RDW-SD', 'rdw')]);
    expect(
      index.select('RDW-CV 12.5 standard SD note').matches[0]?.variant,
    ).toBe('cv');
  });
  it('reconstructs split uppercase codes without accepting a prefix of a percentage code', () => {
    const index = new PdfNameIndex([
      point(1, 'MC'),
      point(2, 'MCH'),
      point(3, 'MC%'),
    ]);
    expect(index.select('MC\nH 12.5').matches[0]?.point.id).toBe(2);
    expect(index.select('MC\n% 12.5').matches[0]?.point.id).toBe(3);
    expect(index.select('MC other H 12.5').matches[0]?.point.id).toBe(1);
  });
  it('blocks a generic cholesterol match with an unsupported modifier', () => {
    expect(
      new PdfNameIndex([point(1, 'Холестерин', 'cholesterol')]).select(
        'Холестерин не-ЛПВП 12.5',
      ).matches,
    ).toEqual([]);
  });
  it('finds a split result header and respects a reference boundary', () => {
    expect(
      headerColumns(row(['Показатель', 'Резуль', 'тат', 'Референс'])),
    ).toMatchObject({ name: 0, result: 1, end: 3 });
  });
  it('keeps empty-cell positions in evidence', () => {
    const view = row(['', 'ABC', '12.5']);
    expect(view.spans[1]).toEqual({ start: 1, end: 4 });
    expect(view.cells).toHaveLength(3);
  });
  it('validates a repeated grid but never infers word-cut text columns', () => {
    const index = new PdfNameIndex([point(1, 'ABC')]);
    const cells = [
      ['ABC', '12.5', '1 20'],
      ['ABC', '13.5', '1 20'],
    ];
    const grids = cells.map((cells) => ({
      ...row(cells),
      method: 'lines' as const,
    }));
    expect(inferResultColumns(grids, index)).toMatchObject({
      result: 1,
      end: 2,
    });
    expect(
      inferResultColumns(
        grids.map((r) => ({ ...r, method: 'text' })),
        index,
      ),
    ).toBeUndefined();
    expect(
      inferResultColumns(
        [row(['ABC', '12 14', '8']), row(['ABC', '13 15', '8'])].map((r) => ({
          ...r,
          method: 'lines',
        })),
        index,
      ),
    ).toBeUndefined();
    expect(
      inferResultColumns(
        [row(['ABC', '12.5', '8']), row(['ABC', '13.5', '8'])].map((r) => ({
          ...r,
          method: 'lines',
        })),
        index,
      ),
    ).toBeUndefined();
  });
  it('reconstructs only a decimal fragment, not two independent numbers', () => {
    expect(parseResult('12\n,5')).toEqual({ value: 12.5 });
    expect(parseResult('12,\n5')).toEqual({ value: 12.5 });
    expect(parseResult('12\n5')).toEqual({
      warning: 'result_region_ambiguous',
    });
  });
  it('ignores ranges, dates, exponent annotations and embedded code numbers', () => {
    expect(
      numericTokens('HbA1c 12.5 10^9 2-20 01.02.2020').map((n) => n.value),
    ).toEqual([12.5]);
  });
  it('does not read a medical method code or an ordinal as a result', () => {
    expect(
      numericTokens('A09.05.022 3-я генерация 12.5').map((n) => n.value),
    ).toEqual([12.5]);
  });
  it.each(['-1', '- 1', '3000', '<12.5'])(
    'does not erase a rejected sign or operator: %s',
    (text) => {
      expect(parseResult(text)).toEqual({
        warning: 'unsupported_numeric_result',
      });
    },
  );
  it('merges corroborating representations and rejects conflicting values regardless of order', () => {
    const name = new PdfNameIndex([point(1, 'ABC')]).select('ABC 12.5')
      .matches[0];
    const one = {
      name,
      value: 12.5,
      row: row(['ABC', '12.5']),
      valueStart: 4,
      rule: 'named_record',
    };
    expect(resolvePdfPairs([one, one]).findings).toHaveLength(1);
    expect(resolvePdfPairs([one, { ...one, value: 13 }])).toEqual({
      findings: [],
      conflicts: 1,
    });
    expect(resolvePdfPairs([{ ...one, value: 13 }, one])).toEqual({
      findings: [],
      conflicts: 1,
    });
  });
});
