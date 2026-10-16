import { ExtractionMethod } from '../pdf-parser/pdf-parser.types';

export interface PdfRowEvidence {
  page: number;
  table: number;
  row: number;
  endRow: number;
  method: ExtractionMethod;
  cells: string[];
  text: string;
  spans: { start: number; end: number }[];
}

export function rowEvidence(
  cells: string[],
  source: Pick<PdfRowEvidence, 'page' | 'table' | 'row' | 'method'> &
    Partial<Pick<PdfRowEvidence, 'endRow'>>,
): PdfRowEvidence {
  let position = 0;
  const spans = cells.map((cell) => {
    const span = { start: position, end: position + cell.length };
    position += cell.length + 1;
    return span;
  });
  return {
    page: source.page,
    table: source.table,
    row: source.row,
    endRow: source.endRow ?? source.row,
    method: source.method,
    cells,
    spans,
    text: cells.join('\n'),
  };
}

export function isMetadata(text: string): boolean {
  return /^\s*(?:материал\s*:|комментар|примечан|дата\b|возраст\b|заказ\b|пациент\b|врач\b|адрес\b|метод\b|заключение\b)/iu.test(
    text,
  );
}
