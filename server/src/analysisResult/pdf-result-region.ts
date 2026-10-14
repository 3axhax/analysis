import { canonicalName } from './pdf-name-index';
import { PdfRowEvidence } from './pdf-row-evidence';
import { PdfNameIndex } from './pdf-name-index';
import { parseResult, numericTokens } from './pdf-value-parser';

export interface ResultColumns {
  name?: number;
  result: number;
  end: number;
  header: number;
}

export function inferResultColumns(
  rows: PdfRowEvidence[],
  index: PdfNameIndex,
): ResultColumns | undefined {
  // Text-strategy columns are word cuts, not reliable physical fields.
  // Without an explicit header, infer only a compact grid of actual ruling lines.
  if (rows.some((row) => row.method !== 'lines' || row.cells.length > 5))
    return undefined;
  const qualifying: { name: number; result: number; end: number }[] = [];
  for (const row of rows) {
    if (row.cells.length < 2) continue;
    const selected = index.select(row.text);
    if (!selected.matches.length) continue;
    const match = selected.matches[0];
    const name = row.spans.findIndex(
      (span) => match.start >= span.start && match.start < span.end,
    );
    const possible: { result: number; end: number }[] = [];
    for (let col = name + 1; col < row.cells.length; col++) {
      let end = col + 1;
      if (
        (/\d[.,]\s*$/.test(row.cells[col]) &&
          /^\s*\d+/.test(row.cells[end] ?? '')) ||
        (/\d\s*$/.test(row.cells[col]) &&
          /^\s*[.,]\d+/.test(row.cells[end] ?? ''))
      )
        end++;
      const cell = row.cells.slice(col, end).join('\n');
      if (numericTokens(cell).length > 1 && possible.length === 0)
        return undefined;
      if (
        /^\s*[*↑↓]*\s*[<>≤≥]?[+-]?(?:\d|[.,]\d)/u.test(cell) &&
        parseResult(cell).value !== undefined
      )
        possible.push({ result: col, end });
    }
    if (possible.length > 1) return undefined;
    if (possible.length === 1) qualifying.push({ name, ...possible[0] });
  }
  if (
    qualifying.length < 2 ||
    new Set(qualifying.map((r) => `${r.name}:${r.result}:${r.end}`)).size !== 1
  )
    return undefined;
  return { ...qualifying[0], header: -1 };
}

export function headerColumns(row: PdfRowEvidence): ResultColumns | undefined {
  const starts: { role: string; column: number }[] = [];
  for (let i = 0; i < row.cells.length; i++) {
    const text = canonicalName(row.cells[i]);
    const compact = text.replace(/\s+/g, '');
    if (/рефер|норм|reference|range/.test(text))
      starts.push({ role: 'reference', column: i });
    else if (/^(результат|result|значение)$/.test(compact))
      starts.push({ role: 'result', column: i });
    else if (
      /^(показатель|исследование|наименование|parameter|test|analyte)$/.test(
        text,
      )
    )
      starts.push({ role: 'name', column: i });
    else if (/единиц|ед изм|^unit/.test(text))
      starts.push({ role: 'boundary', column: i });
    else {
      for (let j = i + 1; j < Math.min(row.cells.length, i + 4); j++) {
        const joined = canonicalName(
          row.cells.slice(i, j + 1).join(''),
        ).replace(/\s+/g, '');
        if (joined === 'результат' || joined === 'result') {
          starts.push({ role: 'result', column: i });
          break;
        }
      }
    }
  }
  const result = starts.filter((s) => s.role === 'result');
  if (result.length !== 1 || row.cells.length === 1) return undefined;
  return {
    result: result[0].column,
    end: starts
      .filter((s) => s.column > result[0].column)
      .reduce((end, s) => Math.min(end, s.column), row.cells.length),
    name: starts.find((s) => s.role === 'name')?.column,
    header: row.row,
  };
}

export function resultRegion(
  row: PdfRowEvidence,
  nameEnd: number,
  columns?: ResultColumns,
): { text: string; start: number; rule: string } {
  if (columns) {
    return {
      text: row.cells.slice(columns.result, columns.end).join('\n'),
      start: row.spans[columns.result]?.start ?? 0,
      rule:
        columns.header < 0 ? 'validated_grid_column' : 'explicit_result_column',
    };
  }
  const nameCell = row.spans.findIndex(
    (span) => nameEnd > span.start && nameEnd <= span.end,
  );
  if (
    row.method === 'lines' &&
    nameCell >= 0 &&
    row.cells.slice(0, nameCell).every((cell) => !cell.trim())
  ) {
    const result = nameCell + 1;
    const tail = row.cells.slice(result + 1).filter((cell) => cell.trim());
    const explicitReference =
      tail.length > 0 &&
      tail.every(
        (cell) =>
          /^\s*[<>≤≥]/u.test(cell) ||
          /\d+(?:[.,]\d+)?\s*[-–—]\s*\d+/u.test(cell),
      );
    if (
      explicitReference &&
      parseResult(row.cells[result] ?? '').value !== undefined
    )
      return {
        text: row.cells[result],
        start: row.spans[result].start,
        rule: 'separate_reference_expression',
      };
  }
  const rawText = row.text.slice(nameEnd);
  // A name alias can omit its final abbreviation dot; never strip .5.
  const punctuation = /^\s*[.,:;]\s+(?=[*↑↓+-]?\s*\d)/u.exec(rawText);
  const offset = punctuation?.[0].length ?? 0;
  const text = rawText.slice(offset);
  const boundary = text.search(
    /референ|референт|reference|норма|материал\s*:|метод\s*:|комментар/iu,
  );
  const bounded = boundary >= 0 ? text.slice(0, boundary) : text;
  // Recognize a complete record prefix, not the first number in arbitrary prose.
  // Unit-like text is only a delimiter: no unit lookup or assignment occurs here.
  const simple =
    /^\s*[*↑↓]*\s*([+-]?\s*(?:\d+(?:\s*[.,]\s*\d+)?|[.,]\d+))\s+([\p{L}µμ%][\p{L}\p{N}µμ%/·*^⁰¹²³⁴⁵⁶⁷⁸⁹-]*)\s+((?:[<>≤≥]\s*[+-]?\d+(?:[.,]\d+)?|[+-]?\d+(?:[.,]\d+)?\s*[-–—]\s*[+-]?\d+(?:[.,]\d+)?))(?:\s+[\p{L}][\p{L}\s,().:/-]*)?\s*$/u.exec(
      bounded,
    );
  if (simple && parseResult(simple[1]).value !== undefined) {
    const resultEnd = bounded.indexOf(simple[1]) + simple[1].length;
    return {
      text: bounded.slice(0, resultEnd),
      start: nameEnd + offset,
      rule: 'simple_named_result_unit_reference',
    };
  }
  return {
    text: bounded,
    start: nameEnd + offset,
    rule: 'named_record',
  };
}
