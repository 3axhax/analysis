import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';

export interface PreparedSourceRow {
  name: string;
  value: number | string;
  unit: string | null;
}

export interface PreparedDbRow extends PreparedSourceRow {
  id: number;
}

export function isPreparedDbRows(value: unknown): value is PreparedDbRow[] {
  return (
    Array.isArray(value) &&
    value.every((candidate: unknown) => {
      if (!candidate || typeof candidate !== 'object') return false;
      const row = candidate as Record<string, unknown>;
      return (
        Object.keys(row).sort().join(',') === 'id,name,unit,value' &&
        Number.isSafeInteger(row.id) &&
        Number(row.id) > 0 &&
        isPreparedRows(
          [{ name: row.name, value: row.value, unit: row.unit }],
          true,
        )
      );
    })
  );
}

export function isPreparedRows(
  value: unknown,
  allowNull: boolean,
): value is PreparedSourceRow[] {
  return (
    Array.isArray(value) &&
    value.every((candidate: unknown) => {
      if (!candidate || typeof candidate !== 'object') return false;
      const row = candidate as Record<string, unknown>;
      return (
        row &&
        typeof row === 'object' &&
        Object.keys(row).sort().join(',') === 'name,unit,value' &&
        typeof row.name === 'string' &&
        row.name.trim().length > 0 &&
        ((typeof row.value === 'string' && row.value.length > 0) ||
          (typeof row.value === 'number' && Number.isFinite(row.value))) &&
        (typeof row.unit === 'string' || (allowNull && row.unit === null))
      );
    })
  );
}

export function isPreparedExtraction(
  value: unknown,
): value is ExtractTablesResponse {
  if (!value || typeof value !== 'object') return false;
  const response = value as Partial<ExtractTablesResponse>;
  const methods = new Set([
    'lines',
    'text',
    'coordinates',
    'ocr',
    'ocr-repair',
  ]);
  return (
    response.success === true &&
    Number.isInteger(response.total_pages) &&
    Number.isInteger(response.pages_processed) &&
    Number.isInteger(response.pages_ocr) &&
    (response.total_pages ?? 0) > 0 &&
    (response.pages_processed ?? -1) >= 0 &&
    (response.pages_processed ?? Infinity) <= (response.total_pages ?? 0) &&
    (response.pages_ocr ?? -1) >= 0 &&
    (response.pages_ocr ?? Infinity) <= (response.pages_processed ?? 0) &&
    Array.isArray(response.tables) &&
    response.tables.every(
      (page) =>
        page &&
        Number.isInteger(page.page) &&
        page.page > 0 &&
        page.page <= (response.total_pages ?? 0) &&
        Array.isArray(page.tables) &&
        page.tables.every(
          (table) =>
            table &&
            methods.has(table.method) &&
            Array.isArray(table.data) &&
            table.data.length === table.rows &&
            table.data.every(
              (row) =>
                Array.isArray(row) &&
                row.length <= table.cols &&
                row.every((cell) => typeof cell === 'string'),
            ),
        ),
    )
  );
}
