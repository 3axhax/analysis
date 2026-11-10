import { BadRequestException } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  Equals,
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
  @Transform(({ value }: TransformFnParams) => value === 'null' ? null : value)
  @Equals(null)
  sourceId: null;

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

function parseLimitValue(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
  if (typeof value !== 'number' && typeof value !== 'string') throw new BadRequestException('Invalid limit value');
  const parsed = Number(typeof value === 'string' ? value.trim().replace(',', '.') : value);
  if (!Number.isFinite(parsed)) throw new BadRequestException('Invalid limit value');
  return parsed;
}

export class AddNewAnalysisPointQueryDto {
  @Transform(({ value }: TransformFnParams) => value === 'null' ? null : value)
  @Equals(null)
  sourceId: null;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  translationRu: string;

  @IsString()
  @IsOptional()
  translationEn: string;

  @IsString()
  @IsOptional()
  parsingWords: string;

  @IsString()
  @IsOptional()
  pointHintRu: string;

  @IsString()
  @IsOptional()
  pointHintEn: string;

  @Transform(({ value }: TransformFnParams): AnalysisPointLimit[] => {
    if (!Array.isArray(value)) return [];
    return value.map((limit: Record<string, unknown>) => ({
      age: String(limit.age ?? ''),
      unit: String(limit.unit ?? ''),
      gender: String(limit.gender ?? ''),
      minValue: parseLimitValue(limit.minValue),
      maxValue: parseLimitValue(limit.maxValue),
      lowInclusive: limit.lowInclusive === true,
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
