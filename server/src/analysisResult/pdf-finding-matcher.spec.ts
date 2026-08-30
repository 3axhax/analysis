import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import {
  ExtractedTable,
  ExtractTablesResponse,
  ExtractionMethod,
} from '../pdf-parser/pdf-parser.types';
import {
  canonicalPdfText,
  HybridPdfFindingMatcher,
  LegacyPdfFindingMatcher,
  StructuredPdfFindingMatcher,
  tolerantPdfText,
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

const structured = new StructuredPdfFindingMatcher();
const hybrid = new HybridPdfFindingMatcher();

describe('PDF text normalization', () => {
  it('keeps canonical and confusable normalization separate', () => {
    expect(canonicalPdfText('  Мarker\u00a0— Test ')).toBe('мarker-test');
    expect(tolerantPdfText('Мarker')).toBe('marker');
  });
});

describe('LegacyPdfFindingMatcher characterization', () => {
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

describe('StructuredPdfFindingMatcher', () => {
  it('selects result and unit columns instead of a reference range', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Ед. изм.', 'Референс'],
              ['Synthetic marker', '12,5', 'mmol/l', '4,0 - 10,0'],
            ]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Synthetic marker',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
      ],
    );

    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, value: 12.5, unitId: 7 }),
    ]);
    expect(result.warnings).not.toContain('conflicting_values_require_review');
  });

  it('deduplicates one physical row across extractors before matching', () => {
    const rows = [
      ['Показатель', 'Результат'],
      ['Synthetic marker', '12.5'],
    ];
    const result = structured.match(
      extraction([
        { page: 1, tables: [table(rows, 'lines'), table(rows, 'text')] },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings).toHaveLength(1);
    expect(result.stats.candidateRows).toBe(4);
    expect(result.stats.logicalRows).toBe(1);
    expect(result.stats.pointCandidates).toBe(1);
  });

  it('carries explicit column roles to a compatible table continuation', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Единица'],
              ['First marker', '1.5', 'mmol/l'],
            ]),
            table([['Second marker', '2.5', 'mmol/l']]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'First marker',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
        point(2, {
          parsingWords: 'Second marker',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
      ],
    );

    expect(result.findings.map((finding) => finding.id)).toEqual([1, 2]);
  });

  it('keeps strict context for a short alias in a table continuation', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Long marker', '1.5'],
            ]),
            table([['AB', '2.5']]),
          ],
        },
      ]),
      [
        point(1, { parsingWords: 'Long marker' }),
        point(2, { parsingWords: 'AB' }),
      ],
    );

    expect(result.findings.map((finding) => finding.id)).toEqual([1, 2]);
  });

  it('supports reordered name, unit and result columns', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Результат', 'Единица', 'Показатель', 'Референс'],
              ['7.25', 'mmol/l', 'Synthetic marker', '1-4'],
            ]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Synthetic marker',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
      ],
    );

    expect(result.findings[0]).toEqual(
      expect.objectContaining({ id: 1, value: 7.25, unitId: 7 }),
    );
  });

  it('does not turn duplicate extractor rows into a false conflict', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table(
              [
                ['Показатель', 'Результат', 'Референс'],
                ['Synthetic marker', '12.5', '4-10'],
              ],
              'lines',
            ),
            table(
              [
                ['Показатель', 'Результат', 'Референс'],
                ['Synthetic marker', '12.5', '4 - 10'],
              ],
              'coordinates',
            ),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].value).toBe(12.5);
    expect(result.warnings).not.toContain('conflicting_values_require_review');
  });

  it('rejects genuinely conflicting equally strong result values', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Synthetic marker', '12.5'],
              ['Synthetic marker', '15.5'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toContain('conflicting_values_require_review');
    expect(result.stats.ambiguous).toBe(1);
  });

  it('allows a short alias only in an explicit name column', () => {
    const catalog = [point(1, { parsingWords: 'AB' })];
    const accepted = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Примечание'],
              ['AB', '2.5', 'synthetic'],
            ]),
          ],
        },
      ]),
      catalog,
    );
    const rejected = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Примечание'],
              ['Other marker', '2.5', 'AB'],
            ]),
          ],
        },
      ]),
      catalog,
    );

    expect(accepted.findings).toHaveLength(1);
    expect(rejected.findings).toHaveLength(0);
  });

  it('accepts a canonical short English alias in the original first-column context', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [table([['AB', '2.5']])],
        },
      ]),
      [point(1, { parsingWords: 'AB' })],
    );

    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, value: 2.5 }),
    ]);
  });

  it('returns an actual collision as ambiguous only for the affected row', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Shared marker', '2.5'],
            ]),
          ],
        },
      ]),
      [
        point(1, { parsingWords: 'Shared marker' }),
        point(2, { parsingWords: 'Shared marker' }),
      ],
    );

    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toContain('ambiguous_alias_requires_review');
  });

  it('uses an explicit allowed unit to resolve a colliding alias', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Единица'],
              ['Shared marker', '2.5', 'mmol/l'],
            ]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Shared marker',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
        point(2, {
          parsingWords: 'Shared marker',
          units: [{ id: 8, name: 'percent' }],
        }),
      ],
    );

    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, unitId: 7 }),
    ]);
  });

  it('uses RU/EN names only when no primary alias matches', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Fallback name', '2.5'],
            ]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Primary alias',
          translationEn: 'Fallback name',
        }),
      ],
    );

    expect(result.findings).toEqual([
      expect.objectContaining({ id: 1, value: 2.5 }),
    ]);
  });

  it('does not let a translation shadow another point primary alias', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Shared name', '2.5'],
            ]),
          ],
        },
      ]),
      [
        point(1, { parsingWords: 'Shared name' }),
        point(2, {
          parsingWords: 'Another primary',
          translationEn: 'Shared name',
        }),
      ],
    );

    expect(result.findings.map((finding) => finding.id)).toEqual([1]);
  });

  it('accepts a contextual tolerant match without replacing canonical keys', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Мarker', '2.5'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Marker' })],
    );

    expect(result.findings).toHaveLength(1);
  });

  it('parses scientific notation and keeps review warnings for inequalities', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Synthetic marker', '<1,2e4'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings[0]).toEqual(
      expect.objectContaining({ value: 12000 }),
    );
    expect(result.findings[0].warnings).toEqual(
      expect.arrayContaining([
        'inequality_requires_review',
        'large_value_requires_review',
      ]),
    );
  });

  it('preserves zero and negative values with explicit review warnings', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Zero marker', '0'],
              ['Negative marker', '-2.5'],
            ]),
          ],
        },
      ]),
      [
        point(1, { parsingWords: 'Zero marker' }),
        point(2, { parsingWords: 'Negative marker' }),
      ],
    );

    expect(
      result.findings.find((finding) => finding.id === 1)?.warnings,
    ).toContain('zero_value_requires_review');
    expect(
      result.findings.find((finding) => finding.id === 2)?.warnings,
    ).toContain('negative_value_requires_review');
  });

  it('does not use a range, date or multi-number result as a scalar value', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Range marker', '4-10'],
              ['Date marker', '30.08.2026'],
              ['Multiple marker', '2.5 3.5'],
            ]),
          ],
        },
      ]),
      [
        point(1, { parsingWords: 'Range marker' }),
        point(2, { parsingWords: 'Date marker' }),
        point(3, { parsingWords: 'Multiple marker' }),
      ],
    );

    expect(result.findings).toHaveLength(0);
  });

  it('merges the same point and value repeated on multiple pages', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Synthetic marker', '2.5'],
            ]),
          ],
        },
        {
          page: 2,
          tables: [table([['Synthetic marker', '2.5']])],
        },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings).toHaveLength(1);
    expect(result.warnings).not.toContain('conflicting_values_require_review');
  });

  it('does not infer the only allowed unit when it is absent from the row', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат'],
              ['Synthetic marker', '2.5'],
            ]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Synthetic marker',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
      ],
    );

    expect(result.findings[0].unitId).toBeNull();
    expect(result.findings[0].warnings).toContain('unit_requires_selection');
  });

  it('leaves overlapping unit matches ambiguous', () => {
    const result = structured.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Показатель', 'Результат', 'Единица'],
              ['Synthetic marker', '2.5', 'mmol/l'],
            ]),
          ],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Synthetic marker',
          units: [
            { id: 7, name: 'mmol' },
            { id: 8, name: 'mmol_l' },
          ],
        }),
      ],
    );

    expect(result.findings[0].unitId).toBeNull();
    expect(result.findings[0].warnings).toContain('ambiguous_unit');
  });

  it('ignores unknown points and empty tables', () => {
    const result = structured.match(
      extraction([
        { page: 1, tables: [table([]), table([['Unknown', '2.5']])] },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toContain('no_supported_findings');
  });
});

describe('HybridPdfFindingMatcher', () => {
  it('restores an original first-cell/second-cell result rejected by structured parsing', () => {
    const result = hybrid.match(
      extraction([
        {
          page: 1,
          tables: [table([['AB', '12.5 4-10']])],
        },
      ]),
      [
        point(1, {
          parsingWords: 'AB',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
      ],
    );

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toEqual(
      expect.objectContaining({ id: 1, value: 12.5, unitId: 7 }),
    );
    expect(result.findings[0].warnings).toEqual(
      expect.arrayContaining([
        'legacy_compatibility_fallback',
        'legacy_multiple_numeric_candidates',
        'unit_assumed_from_single_allowed',
      ]),
    );
  });

  it('keeps a structured result instead of adding a legacy duplicate', () => {
    const result = hybrid.match(
      extraction([
        {
          page: 1,
          tables: [
            table([
              ['Результат', 'Показатель'],
              ['2.5', 'Synthetic marker'],
            ]),
          ],
        },
      ]),
      [point(1, { parsingWords: 'Synthetic marker' })],
    );

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].warnings).not.toContain(
      'legacy_compatibility_fallback',
    );
  });

  it('adds a unique abbreviation point suppressed by a generic structured alias', () => {
    const result = hybrid.match(
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
        point(2, {
          parsingWords: 'SMA',
          units: [{ id: 7, name: 'mmol_l' }],
        }),
      ],
    );

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 2, value: 2.5, unitId: 7 }),
      ]),
    );
  });

  it('uses normalized legacy fallback for a punctuated abbreviation and multi-number cell', () => {
    const result = hybrid.match(
      extraction([
        {
          page: 1,
          tables: [table([['RBC,', '4.5 10^12/l']])],
        },
      ]),
      [
        point(1, {
          parsingWords: 'RBC',
          units: [{ id: 7, name: 'synthetic_unit' }],
        }),
      ],
    );

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]).toEqual(
      expect.objectContaining({ id: 1, value: 4.5, unitId: 7 }),
    );
    expect(result.findings[0].warnings).toEqual(
      expect.arrayContaining([
        'legacy_compatibility_fallback',
        'legacy_multiple_numeric_candidates',
        'unit_assumed_from_single_allowed',
      ]),
    );
  });

  it('does not assume one unit when several units are allowed', () => {
    const result = hybrid.match(
      extraction([
        {
          page: 1,
          tables: [table([['Synthetic marker', '2.5']])],
        },
      ]),
      [
        point(1, {
          parsingWords: 'Synthetic marker',
          units: [
            { id: 7, name: 'mmol_l' },
            { id: 8, name: 'percent' },
          ],
        }),
      ],
    );

    expect(result.findings[0].unitId).toBeNull();
    expect(result.findings[0].warnings).toContain('unit_requires_selection');
  });
});
