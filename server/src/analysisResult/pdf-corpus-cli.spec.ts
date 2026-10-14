import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  access,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const execute = promisify(execFile);

describe('Nest corpus CLI input handling', () => {
  it('warns about missing prepared files without creating them or exposing invalid contents', async () => {
    const root = await mkdtemp(join(tmpdir(), 'nest-corpus-synthetic-'));
    const snapshot = join(root, 'snapshot');
    try {
      await Promise.all(
        ['sources', 'python-results', 'DB-results', 'snapshot'].map((folder) =>
          mkdir(join(root, folder)),
        ),
      );
      await writeFile(join(root, '01.pdf'), ''); // Inventory only: never parsed.
      await writeFile(join(snapshot, 'catalog.json'), '[]');
      await writeFile(
        join(snapshot, 'expected.json'),
        JSON.stringify({
          cases: [
            {
              base: '01',
              alias: 'doc-01',
              expected: [],
              sourceCount: 0,
              subset: 'development',
              fingerprint: 'unused',
              expectedFingerprint: 'unused',
            },
          ],
        }),
      );
      const run = async () =>
        execute(process.execPath, [
          resolve('node_modules/ts-node/dist/bin.js'),
          '--transpile-only',
          resolve('scripts/nest-parsing-corpus.ts'),
          root,
          snapshot,
          'current',
        ]);
      const missing = await run();
      expect(missing.stdout).toContain('missing_prepared_json');
      await expect(
        access(join(root, 'python-results', '01-python.json')),
      ).rejects.toThrow();
      await writeFile(join(root, 'sources', '01.json'), '[]');
      await writeFile(join(root, 'DB-results', '01-db.json'), '[]');
      await writeFile(
        join(root, 'python-results', '01-python.json'),
        'PRIVATE_SENTINEL_INVALID_JSON',
      );
      const invalid = await run();
      expect(invalid.stdout).toContain('invalid_json');
      expect(invalid.stdout + invalid.stderr).not.toContain('PRIVATE_SENTINEL');
      expect(
        await readFile(join(root, 'python-results', '01-python.json'), 'utf8'),
      ).toBe('PRIVATE_SENTINEL_INVALID_JSON');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }, 15000);
});
