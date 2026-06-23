// pdf-parser/pdf-parser.types.ts

/**
 * Информация о таблице, извлеченной из PDF
 */
export interface ExtractedTable {
  /** Метод извлечения: 'auto', 'lines', 'coordinates' */
  method: 'auto' | 'lines' | 'coordinates';
  /** Данные таблицы в виде двумерного массива строк */
  data: string[][];
  /** Количество строк в таблице */
  rows: number;
  /** Количество колонок в таблице */
  cols: number;
  /** Границы таблицы (только для метода 'lines') */
  bbox?: [number, number, number, number];
}

/**
 * Таблицы на одной странице
 */
export interface PageTables {
  /** Номер страницы (1-based) */
  page: number;
  /** Список таблиц на странице */
  tables: ExtractedTable[];
}

/**
 * Ответ от Python микросервиса /extract-tables
 */
export interface ExtractTablesResponse {
  /** Успешность выполнения */
  success: boolean;
  /** Общее количество страниц в PDF */
  total_pages: number;
  /** Список таблиц по страницам */
  tables: PageTables[];
  /** Полный текст документа (для отладки) */
  all_text: string;
  /** Текст в случае, если таблицы не найдены (fallback) */
  fallback_text?: string;
}

/**
 * Ошибка от Python микросервиса
 */
export interface ExtractTablesErrorResponse {
  /** Всегда false при ошибке */
  success: false;
  /** Сообщение об ошибке */
  message?: string;
  /** Детали ошибки */
  error?: string;
  /** HTTP статус код */
  statusCode?: number;
}

/**
 * Параметры для извлечения таблиц
 */
export interface ExtractTablesOptions {
  /** Страницы для парсинга: "1,2,3" или "1-5" */
  pages?: string;
  /** Настройки таблиц для pdfplumber */
  tableSettings?: {
    /** Стратегия поиска вертикальных линий: 'lines', 'text', 'explicit' */
    vertical_strategy?: 'lines' | 'text' | 'explicit';
    /** Стратегия поиска горизонтальных линий: 'lines', 'text', 'explicit' */
    horizontal_strategy?: 'lines' | 'text' | 'explicit';
    /** Толерантность привязки (snap_tolerance) */
    snap_tolerance?: number;
    /** Дополнительные настройки pdfplumber */
    [key: string]: any;
  };
}

/**
 * Нормализованный результат парсинга (после обработки в NestJS)
 */
export interface NormalizedMedicalReport {
  /** Успешность парсинга */
  success: boolean;
  /** Найденные показатели */
  findings: FindingPoint[];
  /** Общее количество страниц */
  totalPages: number;
  /** Метаданные документа */
  metadata?: {
    patientName?: string;
    orderNumber?: string;
    registeredDate?: string;
  };
  /** Исходный ответ от Python сервиса (для отладки) */
  rawResponse?: ExtractTablesResponse;
}

/**
 * Точка анализа (показатель)
 */
export interface FindingPoint {
  /** ID показателя в базе данных */
  id?: number;
  /** Название показателя */
  name: string;
  /** Найденное значение */
  value: number;
  /** Исходное значение (строкой) */
  rawValue?: string;
  /** Единица измерения */
  unit?: string;
  /** Референсные значения */
  reference?: string;
}
