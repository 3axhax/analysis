export type ExtractionMethod = 'lines' | 'text' | 'coordinates' | 'ocr';

export interface ExtractedTable {
  method: ExtractionMethod;
  data: string[][];
  rows: number;
  cols: number;
}

export interface PageTables {
  page: number;
  tables: ExtractedTable[];
}

export interface ExtractTablesResponse {
  success: true;
  total_pages: number;
  pages_processed: number;
  pages_ocr: number;
  tables: PageTables[];
}

export interface ExtractTablesOptions {
  pages?: string;
  tableSettings?: {
    vertical_strategy?: 'lines' | 'text';
    horizontal_strategy?: 'lines' | 'text';
    snap_tolerance?: number;
  };
}
