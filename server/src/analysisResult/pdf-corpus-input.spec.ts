import { isPreparedRows, isPreparedExtraction } from './pdf-corpus-input';

describe('prepared corpus inputs', () => {
  it('accepts an empty DB set and rejects malformed or additional fields', () => {
    expect(isPreparedRows([], true)).toBe(true);
    expect(
      isPreparedRows([{ name: 'Synthetic', value: 1, unit: null }], true),
    ).toBe(true);
    expect(
      isPreparedRows([{ name: 'Synthetic', value: 1, unit: null }], false),
    ).toBe(false);
    expect(
      isPreparedRows(
        [{ name: 'Synthetic', value: 1, unit: '', raw: 'private' }],
        false,
      ),
    ).toBe(false);
  });
  it('validates a parser response rather than only the tables array', () => {
    const response = {
      success: true,
      total_pages: 1,
      pages_processed: 1,
      pages_ocr: 0,
      tables: [
        {
          page: 1,
          tables: [
            {
              method: 'ocr-repair',
              rows: 1,
              cols: 2,
              data: [['Synthetic', '1']],
            },
          ],
        },
      ],
    };
    expect(isPreparedExtraction(response)).toBe(true);
    expect(isPreparedExtraction({ ...response, success: false })).toBe(false);
    expect(
      isPreparedExtraction({
        ...response,
        tables: [
          {
            page: 1,
            tables: [{ method: 'text', rows: 1, cols: 1, data: [[123]] }],
          },
        ],
      }),
    ).toBe(false);
  });
});
