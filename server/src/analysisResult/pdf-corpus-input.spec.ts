import {
  isPreparedRows,
  isPreparedDbRows,
  isPreparedExtraction,
} from './pdf-corpus-input';

describe('prepared corpus inputs', () => {
  it('requires explicit positive safe integer ids only in DB gold', () => {
    const row = { name: 'Synthetic', value: 0, unit: null };
    expect(isPreparedDbRows([])).toBe(true);
    expect(isPreparedDbRows([{ pointId: 7, ...row, unitId: null }])).toBe(true);
    expect(isPreparedDbRows([row])).toBe(false);
    for (const id of [0, -1, 1.5, '7', null, Number.MAX_SAFE_INTEGER + 1])
      expect(isPreparedDbRows([{ pointId: id, ...row, unitId: null }])).toBe(
        false,
      );
    expect(
      isPreparedDbRows([{ pointId: 7, ...row, unitId: null, extra: true }]),
    ).toBe(false);
    expect(isPreparedDbRows([{ id: 7, ...row }])).toBe(false);
    expect(isPreparedDbRows([{ pointId: 7, ...row }])).toBe(false);
    expect(isPreparedDbRows([{ pointId: 7, ...row, unitId: 2 }])).toBe(false);
    expect(
      isPreparedDbRows([{ pointId: 7, ...row, unit: 'g/l', unitId: null }]),
    ).toBe(false);
    expect(
      isPreparedDbRows([{ pointId: 7, ...row, unit: 'g/l', unitId: 2 }]),
    ).toBe(true);
    for (const unitId of [0, -1, 1.5, '2', Number.MAX_SAFE_INTEGER + 1])
      expect(
        isPreparedDbRows([{ pointId: 7, ...row, unit: 'g/l', unitId }]),
      ).toBe(false);
    expect(
      isPreparedRows([{ id: 7, name: 'Synthetic', value: 0, unit: '' }], false),
    ).toBe(false);
  });
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
