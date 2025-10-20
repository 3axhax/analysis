import { Transform, TransformFnParams } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, Min } from 'class-validator';

interface TranslationsFilters {
  lang?: string;
  namespace?: string;
  module?: string;
  submodule?: string;
  value?: string;
}

function isValidTranslationsFilters(obj: unknown): obj is TranslationsFilters {
  if (typeof obj !== 'object' || obj === null) return false;

  const allowedKeys = ['lang', 'namespace', 'module', 'submodule', 'value'];
  const objKeys = Object.keys(obj);

  // Проверяем что все ключи допустимы и значения - строки
  return objKeys.every(
    (key) =>
      allowedKeys.includes(key) &&
      (typeof (obj as Record<string, unknown>)[key] === 'string' ||
        (obj as Record<string, unknown>)[key] === undefined),
  );
}

export class GetTranslationsListQueryDto {
  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 1;
    return isNaN(num) || num < 1 ? 1 : num;
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  currentPage: number = 1;

  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 20;
    return isNaN(num) || num < 1 ? 20 : num;
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  recordPerPage: number = 20;

  @Transform(({ value }: TransformFnParams): TranslationsFilters => {
    if (!value || typeof value !== 'string') return {};
    try {
      const parsed: unknown = JSON.parse(value);
      return isValidTranslationsFilters(parsed) ? parsed : {};
    } catch {
      return {};
    }
  })
  @IsObject()
  @IsOptional()
  filters: TranslationsFilters = {};
}
