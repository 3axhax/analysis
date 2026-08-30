import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';
import {
  comparePdfMatchers,
  PdfBenchmarkDataset,
} from './pdf-matching-benchmark';

const extraction: ExtractTablesResponse = {
  success: true,
  total_pages: 1,
  pages_processed: 1,
  pages_ocr: 0,
  tables: [
    {
      page: 1,
      tables: [
        {
          method: 'lines',
          rows: 2,
          cols: 3,
          data: [
            ['Результат', 'Показатель', 'Единица'],
            ['12.5', 'Synthetic marker', 'mmol/l'],
          ],
        },
      ],
    },
  ],
};

describe('comparePdfMatchers', () => {
  it('reports aggregate metrics without document payloads', () => {
    const dataset: PdfBenchmarkDataset = {
      catalog: [
        {
          id: 1,
          name: 'syntheticMarker',
          translationRu: 'Синтетический маркер',
          translationEn: 'Synthetic marker',
          parsingWords: 'Synthetic marker',
          parsingOrder: 0,
          units: [{ id: 7, name: 'mmol_l' }],
        },
      ],
      cases: [
        {
          extraction,
          expected: [{ pointId: 1, value: 12.5, unitId: 7 }],
        },
      ],
    };

    const result = comparePdfMatchers(dataset);

    expect(result.legacy.pointPrecision).toBe(0);
    expect(result.legacy.pointRecall).toBe(0);
    expect(result.legacy.errors.missingPoint).toBe(1);
    expect(result.structured).toEqual(
      expect.objectContaining({
        documentsExact: 1,
        pointPrecision: 1,
        pointRecall: 1,
        valueAccuracy: 1,
        unitAccuracy: 1,
      }),
    );
    expect(result.hybrid).toEqual(result.structured);
    expect(JSON.stringify(result)).not.toContain('Synthetic marker');
    expect(JSON.stringify(result)).not.toContain('12.5');
  });
});
