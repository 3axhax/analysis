import { ParseFileService } from './parseFile.service';
import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';

const point = (
  overrides: Partial<AnalysisPointWithTranslation> = {},
): AnalysisPointWithTranslation => ({
  id: 1,
  name: 'syntheticMarker',
  translationRu: 'Синтетический маркер',
  translationEn: 'Synthetic marker',
  parsingWords: 'Synthetic marker',
  parsingOrder: 0,
  ...overrides,
});

const extraction = (rows: string[][]): ExtractTablesResponse => ({
  success: true,
  total_pages: 1,
  pages_processed: 1,
  pages_ocr: 0,
  tables: [{
    page: 1,
    tables: [{ method: 'text', data: rows, rows: rows.length, cols: 2 }],
  }],
});

describe('ParseFileService', () => {
  const file = () => ({ buffer: Buffer.from([1]) }) as Express.Multer.File;

  it('keeps legacy first-column matching and parses decimal comma from the second cell', async () => {
    const service = new ParseFileService(
      { getAllWithTranslation: jest.fn().mockResolvedValue([point()]) } as never,
      { extractTables: jest.fn().mockResolvedValue(extraction([
        ['Synthetic marker', '12,75 mmol/l'],
      ])) } as never,
    );

    const result = await service.parseFile(file());

    expect(result.status).toBe('complete');
    expect(result.findings).toEqual([
      expect.objectContaining({
        id: 1,
        value: 12.75,
        unitId: null,
        unit: null,
        page: 1,
      }),
    ]);
    expect(result).not.toHaveProperty('pointsList');
  });

  it('parses a one-cell row after the matched alias', async () => {
    const service = new ParseFileService(
      { getAllWithTranslation: jest.fn().mockResolvedValue([point()]) } as never,
      { extractTables: jest.fn().mockResolvedValue(extraction([
        ['Synthetic marker 12.5 mmol/l'],
      ])) } as never,
    );

    await expect(service.parseFile(file())).resolves.toEqual(
      expect.objectContaining({
        status: 'complete',
        stats: expect.objectContaining({ candidates: 1, matched: 1 }),
      }),
    );
  });

  it('keeps the legacy first candidate and ignores a reordered alias column', async () => {
    const service = new ParseFileService(
      { getAllWithTranslation: jest.fn().mockResolvedValue([point()]) } as never,
      { extractTables: jest.fn().mockResolvedValue(extraction([
        ['12.75 mmol/l', 'Synthetic marker'],
      ])) } as never,
    );

    const result = await service.parseFile(file());
    expect(result.status).toBe('unsupported');
    expect(result.findings).toHaveLength(0);
    expect(result.warnings).toContain('no_supported_findings');
  });

  it('keeps concurrent requests isolated while returning the new contract', async () => {
    const parser = {
      extractTables: jest.fn().mockImplementation(async (buffer: Buffer) => {
        await new Promise((resolve) => setTimeout(resolve, buffer[0] === 1 ? 20 : 1));
        return extraction([['Synthetic marker', `${buffer[0]} mmol/l`]]);
      }),
    };
    const service = new ParseFileService(
      { getAllWithTranslation: jest.fn().mockResolvedValue([point()]) } as never,
      parser as never,
    );

    const [first, second] = await Promise.all([
      service.parseFile({ buffer: Buffer.from([1]) } as Express.Multer.File),
      service.parseFile({ buffer: Buffer.from([2]) } as Express.Multer.File),
    ]);

    expect(first.findings[0].value).toBe(1);
    expect(second.findings[0].value).toBe(2);
    expect(first.stats.pagesOcr).toBe(0);
  });

  it('rejects excess concurrent PDF requests', async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const service = new ParseFileService(
      { getAllWithTranslation: jest.fn().mockResolvedValue([point()]) } as never,
      { extractTables: jest.fn().mockImplementation(async () => {
        await gate;
        return extraction([['Synthetic marker', '1 mmol/l']]);
      }) } as never,
    );

    const first = service.parseFile(file());
    const second = service.parseFile(file());
    await new Promise((resolve) => setImmediate(resolve));
    await expect(service.parseFile(file())).rejects.toMatchObject({ status: 429 });
    release?.();
    await Promise.all([first, second]);
  });
});
