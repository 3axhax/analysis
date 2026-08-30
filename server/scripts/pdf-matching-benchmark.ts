import { readFile } from 'node:fs/promises';
import {
  comparePdfMatchers,
  isPdfMatcherDataset,
} from '../src/analysisResult/pdf-matching-benchmark';

async function main(): Promise<void> {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error('Benchmark input path is required');
  }
  const raw = await readFile(inputPath, 'utf8');
  const input: unknown = JSON.parse(raw);
  if (!isPdfMatcherDataset(input)) {
    throw new Error('Invalid benchmark input');
  }
  process.stdout.write(
    `${JSON.stringify(comparePdfMatchers(input), null, 2)}\n`,
  );
}

void main().catch(() => {
  process.stderr.write('PDF matcher benchmark failed\n');
  process.exitCode = 1;
});
