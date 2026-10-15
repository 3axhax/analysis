import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import {
  ExtractedTable,
  ExtractTablesResponse,
  ExtractionMethod,
} from '../pdf-parser/pdf-parser.types';
import {
  canonicalPdfText,
  LegacyPdfFindingMatcher,
} from './pdf-finding-matcher';

const point = (
  id: number,
  overrides: Partial<AnalysisPointWithTranslation> = {},
): AnalysisPointWithTranslation => ({
  id,
  name: `point${id}`,
  translationRu: `Показатель ${id}`,
  translationEn: `Point ${id}`,
  parsingWords: `Marker ${id}`,
  parsingOrder: 0,
  units: [],
  ...overrides,
});

const table = (
  data: string[][],
  method: ExtractionMethod = 'lines',
): ExtractedTable => ({
  method,
  data,
  rows: data.length,
  cols: Math.max(0, ...data.map((row) => row.length)),
});

const extraction = (
  pages: Array<{ page: number; tables: ExtractedTable[] }>,
): ExtractTablesResponse => ({
  success: true,
  total_pages: pages.length,
  pages_processed: pages.length,
  pages_ocr: 0,
  tables: pages,
});

describe('PDF text normalization', () => {
  it('normalizes spacing and punctuation without transliterating text', () => {
    expect(canonicalPdfText('  Мarker\u00a0— Test ')).toBe('мarker test');
  });
});

describe('LegacyPdfFindingMatcher characterization', () => {
  it('reads a separate scalar/unit cell before age-specific reference prose without a header', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['СОЭ (автоматический анализатор)', '', ''],
              ['ESR СОЭ', '12 мм/ч', 'Мужчины (до 45 лет) 1 18'],
            ]),
          ],
        },
      ]),
      [point(1, { name: 'esr', parsingWords: 'ESR_СОЭ' })],
    );
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toMatchObject({
      id: 1,
      value: 12,
      unitId: null,
    });
  });
  it.each([false, true])(
    'does not let a generic unsupported width block the catalog CV phrase (reverse=%s)',
    (reverse) => {
      const rows = [
        ['Точность ширины распределения эритроцитов 12 %'],
        ['Ширина распределения эритроцитов 42 фл'],
      ];
      const result = new LegacyPdfFindingMatcher().match(
        extraction([
          {
            page: 1,
            tables: [
              table(reverse ? [...rows].reverse() : rows, 'coordinates'),
            ],
          },
        ]),
        [
          point(1, {
            name: 'rdw',
            parsingWords: 'RDW_Точность ширины распределения эритроцитов',
          }),
        ],
      );
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0]).toMatchObject({
        id: 1,
        value: 12,
        unitId: null,
      });
      expect(result.warnings).not.toContain('conflicting_values');
    },
  );
  it.each([false, true])(
    'does not let unsupported SD block CV (reverse=%s)',
    (reverse) => {
      const rows = [['RDW-SD 42'], ['RDW-CV 12'], ['RDW 12']];
      const result = new LegacyPdfFindingMatcher().match(
        extraction([
          {
            page: 1,
            tables: [
              table(reverse ? [...rows].reverse() : rows, 'coordinates'),
            ],
          },
        ]),
        [point(1, { name: 'rdw', parsingWords: 'RDW' })],
      );
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0]).toMatchObject({
        id: 1,
        value: 12,
        unitId: null,
      });
      expect(result.warnings).toContain('unsupported_name');
      expect(result.warnings).not.toContain('conflicting_values');
    },
  );
  it('still rejects different values of supported RDW/CV', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [table([['RDW 12'], ['RDW-CV 13']], 'coordinates')],
        },
      ]),
      [point(1, { name: 'rdw', parsingWords: 'RDW' })],
    );
    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toContain('conflicting_values');
  });
  it('parses a name across cells while keeping decimal result fragments together', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [
            table([['', 'Synthetic', 'marker', '12', ',5', '4-10']], 'text'),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );
    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, value: 12.5, unitId: null }),
    ]);
  });
  it('uses reordered explicit result and reference columns', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Норма', 'Показатель', 'Результат'],
              ['8', 'Marker', '12.5'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Marker' })],
    );
    expect(result.findings[0].value).toBe(12.5);
  });
  it('does not find the analyte only in a reference column', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Норма'],
              ['Unknown', '12.5', 'Marker 4-10'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Marker' })],
    );
    expect(result.findings).toEqual([]);
    expect(result.warnings).toContain('unrecognized_name');
  });
  it('recognizes a separate comparison as reference in a single-row line grid', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([{ page: 1, tables: [table([['Marker', '12.5', '<20']])] }]),
      [point(1, { parsingWords: 'Marker' })],
    );
    expect(result.findings[0].value).toBe(12.5);
  });
  it('handles a header split across consecutive rows in the same table', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Резуль', 'Норма'],
              ['', 'тат', ''],
              ['Marker', '12.5', '8'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Marker' })],
    );
    expect(result.findings[0].value).toBe(12.5);
  });
  it('links a name continuation only within one table', () => {
    const matcher = new LegacyPdfFindingMatcher(),
      catalog = [point(1, { parsingWords: 'Synthetic marker' })];
    expect(
      matcher.match(
        extraction([
          {
            page: 1,
            tables: [
              table([
                ['Synthetic', ''],
                ['marker', '12.5'],
              ]),
            ],
          },
        ]),
        catalog,
      ).findings[0].value,
    ).toBe(12.5);
    expect(
      matcher.match(
        extraction([
          {
            page: 1,
            tables: [table([['Synthetic', '']]), table([['marker', '12.5']])],
          },
        ]),
        catalog,
      ).findings,
    ).toEqual([]);
  });
  it('does not infer reference scalars as results and does not read metadata', () => {
    const matcher = new LegacyPdfFindingMatcher(),
      catalog = [point(1, { parsingWords: 'Marker' })];
    expect(
      matcher.match(
        extraction([
          {
            page: 1,
            tables: [
              table([
                ['Marker', '12.5', '8'],
                ['Marker', '13.5', '8'],
              ]),
            ],
          },
        ]),
        catalog,
      ).findings,
    ).toEqual([]);
    expect(
      matcher.match(
        extraction([
          { page: 1, tables: [table([['Комментарий Marker 12.5']])] },
        ]),
        catalog,
      ).findings,
    ).toEqual([]);
  });
  it('rejects conflicting pairs independently of extraction order', () => {
    const matcher = new LegacyPdfFindingMatcher(),
      catalog = [point(1, { parsingWords: 'Marker' })];
    const a = table([['Marker', '12.5']]),
      b = table([['Marker 13.5']], 'coordinates');
    const result = matcher.match(
      extraction([{ page: 1, tables: [a, b] }]),
      catalog,
    );
    expect(result.findings).toEqual([]);
    expect(result.warnings).toContain('conflicting_values');
    expect(
      matcher.match(extraction([{ page: 1, tables: [b, a] }]), catalog)
        .findings,
    ).toEqual([]);
  });
  it('treats a repeated analyte comparison after the result as reference text', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([
        {
          page: 1,
          tables: [table([['ABC 12.5 ABC >= 20 comment']], 'coordinates')],
        },
      ]),
      [point(1, { parsingWords: 'ABC' })],
    );
    expect(result.findings[0].value).toBe(12.5);
  });
  it('returns zero from the result cell', () => {
    const result = new LegacyPdfFindingMatcher().match(
      extraction([{ page: 1, tables: [table([['Marker', '0']])] }]),
      [point(1, { parsingWords: 'Marker' })],
    );
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].value).toBe(0);
  });
  it.each(['3000', '3200', 'not a number'])(
    'rejects an unsupported result %s independently',
    (value) => {
      const matcher = new LegacyPdfFindingMatcher();
      const result = matcher.match(
        extraction([{ page: 1, tables: [table([['Marker', value]])] }]),
        [point(1, { parsingWords: 'Marker' })],
      );
      expect(result.findings).toHaveLength(0);
      expect(result.warnings).toContain('no_supported_findings');
    },
  );
  it('keeps the first-column, first-value and 3000-limit behavior', () => {
    const matcher = new LegacyPdfFindingMatcher();
    const result = matcher.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Marker', '12,5 4-10'],
              ['Marker', '3200'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Marker' })],
    );

    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, value: 12.5, unitId: null }),
    ]);
  });

  it('normalizes punctuation around a single-token medical alias', () => {
    const matcher = new LegacyPdfFindingMatcher();
    const result = matcher.match(
      extraction([
        {
          page: 1,
          tables: [table([['RBC,', '4.5 10^12/l']])],
        },
      ]),
      [point(1, { parsingWords: 'RBC' })],
    );

    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, value: 4.5 }),
    ]);
  });

  it('prefers a unique English abbreviation over an earlier generic alias', () => {
    const matcher = new LegacyPdfFindingMatcher();
    const result = matcher.match(
      extraction([
        {
          page: 1,
          tables: [table([['Synthetic marker (SMA)', '2.5']])],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Synthetic marker_Nonmatching long generic alias',
        }),
        point(2, { parsingWords: 'SMA' }),
      ],
    );

    expect(result.findings.map((finding) => finding.id)).toEqual([2]);
  });
});
