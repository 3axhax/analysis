import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';
import {
  benchmarkLegacyPdfMatcher,
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

describe('benchmarkLegacyPdfMatcher', () => {
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

    const result = benchmarkLegacyPdfMatcher(dataset);

    expect(result.pointPrecision).toBe(1);
    expect(result.pointRecall).toBe(1);
    expect(result.valueAccuracy).toBe(1);
    expect(result.unitAccuracy).toBe(0);
    expect(result.errors.missingPoint).toBe(0);
    expect(JSON.stringify(result)).not.toContain('Synthetic marker');
    expect(JSON.stringify(result)).not.toContain('12.5');
  });
});
