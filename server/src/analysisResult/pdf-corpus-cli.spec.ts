import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  access,
  readdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runNestCorpus } from '../../scripts/nest-parsing-corpus';
import type { CorpusCatalogPoint } from './pdf-corpus-expected';

const catalog: CorpusCatalogPoint[] = [
  {
    id: 1,
    name: 'synthetic',
    parsingWords: 'ABC_Marker',
    translationRu: 'Marker',
    translationEn: '',
    parsingOrder: 0,
    units: [],
  },
];
const extraction = (value: string) => ({
  success: true,
  total_pages: 1,
  pages_processed: 1,
  pages_ocr: 0,
  tables: [
    {
      page: 1,
      tables: [{ method: 'lines', rows: 1, cols: 2, data: [['ABC', value]] }],
    },
  ],
});

describe('prepared-only Nest corpus runner without intermediate fixtures', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'nest-corpus-synthetic-'));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });
  const prepare = async (root: string) => {
    await Promise.all(
      ['sources', 'python-results', 'DB-results'].map((folder) =>
        mkdir(join(root, folder)),
      ),
    );
    await writeFile(join(root, '01.pdf'), ''); // Inventory only; cannot be parsed.
    await writeFile(
      join(root, 'sources', '01.json'),
      JSON.stringify([{ name: 'Marker', value: 12, unit: '' }]),
    );
    await writeFile(
      join(root, 'python-results', '01-python.json'),
      JSON.stringify(extraction('12')),
    );
    await writeFile(
      join(root, 'DB-results', '01-db.json'),
      JSON.stringify([{ id: 1, name: 'Marker', value: 12, unit: null }]),
    );
  };
  it('handles missing folders without creating inputs or snapshots', async () => {
    await writeFile(join(root, '01.pdf'), '');
    const result = await runNestCorpus(root, catalog);
    expect(result.files).toBe(0);
    expect(result.warnings.map((w) => w.code)).toEqual([
      'missing_source',
      'missing_python_json',
      'missing_db_json',
    ]);
    expect(await readdir(root)).toEqual(['01.pdf']);
  });
  it('uses modified Python and gold files immediately, without fingerprint gates', async () => {
    await prepare(root);
    expect((await runNestCorpus(root, catalog)).totals.correctPairs).toBe(1);
    await writeFile(
      join(root, 'python-results', '01-python.json'),
      JSON.stringify(extraction('13')),
    );
    const changed = await runNestCorpus(root, catalog);
    expect(changed.files).toBe(1);
    expect(changed.totals.wrongValues).toBe(1);
    await writeFile(
      join(root, 'DB-results', '01-db.json'),
      JSON.stringify([{ id: 1, name: 'Marker', value: 13, unit: null }]),
    );
    expect((await runNestCorpus(root, catalog)).totals.correctPairs).toBe(1);
    expect((await readdir(root)).sort()).toEqual(
      ['01.pdf', 'DB-results', 'python-results', 'sources'].sort(),
    );
  });
  it('uses the current injected catalog and keeps expected independent of actual findings', async () => {
    await prepare(root);
    const next = catalog.map((p) => ({ ...p, id: 7 }));
    expect((await runNestCorpus(root, next)).runs[0].issues).toEqual([
      { row: 1, code: 'unknown_expected_id' },
    ]);
    await writeFile(
      join(root, 'DB-results', '01-db.json'),
      JSON.stringify([{ id: 7, name: 'Marker', value: 12, unit: null }]),
    );
    const empty = {
      match: jest
        .fn()
        .mockReturnValue({ findings: [], warnings: [], stats: {} }),
    };
    const result = await runNestCorpus(root, next, empty);
    expect(result.totals.expectedPairs).toBe(1);
    expect(result.totals.correctPairs).toBe(0);
  });
  it('reports unresolved expected without silently reducing its denominator', async () => {
    await prepare(root);
    const result = await runNestCorpus(root, [
      { ...catalog[0], id: 2, name: 'other' },
    ]);
    expect(result.files).toBe(1);
    expect(result.scoredFiles).toBe(0);
    expect(result.knownExpectedRows).toBe(1);
    expect(result.unscoredExpectedRows).toBe(1);
    expect(result.runs[0]).toMatchObject({
      status: 'unresolved_expected',
      expectedRows: 1,
      unresolvedExpectedRows: 1,
    });
  });
  it('warns on invalid content without leaking or overwriting it', async () => {
    await prepare(root);
    const path = join(root, 'python-results', '01-python.json');
    await writeFile(path, 'PRIVATE_SENTINEL_INVALID_JSON');
    const result = await runNestCorpus(root, catalog);
    expect(result.warnings[0].code).toBe('invalid_json');
    expect(JSON.stringify(result)).not.toContain('PRIVATE_SENTINEL');
    expect(await readFile(path, 'utf8')).toBe('PRIVATE_SENTINEL_INVALID_JSON');
  });
  it('inventories new prepared files and orphans without reading PDF contents', async () => {
    await prepare(root);
    await writeFile(join(root, '02.pdf'), 'PRIVATE_PDF_SENTINEL');
    const result = await runNestCorpus(root, catalog);
    expect(result.documents).toBe(2);
    expect(result.files).toBe(1);
    expect(
      result.warnings.some(
        (w) => w.alias === 'doc-02' && w.code === 'missing_python_json',
      ),
    ).toBe(true);
    await expect(
      access(join(root, 'python-results', '02-python.json')),
    ).rejects.toThrow();
    await rm(join(root, '01.pdf'));
    expect(
      (await runNestCorpus(root, catalog)).warnings.some(
        (w) => w.code === 'missing_pdf',
      ),
    ).toBe(true);
  });
});
