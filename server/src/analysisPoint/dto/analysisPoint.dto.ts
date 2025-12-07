import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AnalysisPointLimit } from '../analysisPoint.types';

interface AnalysisPointFilters {
  name?: string;
  translationRu?: string;
  translationEn?: string;
}

function isValidTranslationsFilters(obj: unknown): obj is AnalysisPointFilters {
  if (typeof obj !== 'object' || obj === null) return false;

  const allowedKeys = ['name', 'translationRu', 'translationEn'];
  const objKeys = Object.keys(obj);

  return objKeys.every(
    (key) =>
      allowedKeys.includes(key) &&
      (typeof (obj as Record<string, unknown>)[key] === 'string' ||
        (obj as Record<string, unknown>)[key] === undefined),
  );
}

export class GetAnalysisPointListQueryDto {
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

  @Transform(({ value }: TransformFnParams): AnalysisPointFilters => {
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
  filters: AnalysisPointFilters = {};
}

export class AddNewAnalysisPointQueryDto {
  @IsString()
  name: string;

  @IsString()
  translationRu: string;

  @IsString()
  translationEn: string;

  @IsString()
  parsingWords: string;

  @Transform(({ value }: TransformFnParams): AnalysisPointLimit[] => {
    if (!Array.isArray(value)) return [];
    return value.map((limit: Record<string, string>) => ({
      age: limit.age ?? '',
      unit: limit.unit ?? '',
      gender: limit.gender ?? '',
      minValue: limit.minValue ? parseInt(limit.minValue) : 0,
      maxValue: limit.maxValue ? parseInt(limit.maxValue) : 0,
    }));
  })
  @IsArray()
  @IsOptional()
  limits: AnalysisPointLimit[] = [];
}

export class EditAnalysisPointQueryDto extends AddNewAnalysisPointQueryDto {
  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 1;
    return isNaN(num) || num < 1 ? 1 : num;
  })
  @IsNumber()
  @Min(1)
  id: number;
}
