import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AnalysisResultDescriptionCondition } from '../../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';

interface AnalysisResultDescriptionsFilters {
  analysisPoint?: number;
}

function isValidTranslationsFilters(
  obj: unknown,
): obj is AnalysisResultDescriptionsFilters {
  if (typeof obj !== 'object' || obj === null) return false;

  const allowedKeys = ['analysisPoint'];
  const objKeys = Object.keys(obj);

  return objKeys.every(
    (key) =>
      allowedKeys.includes(key) &&
      (typeof (obj as Record<string, unknown>)[key] === 'string' ||
        typeof (obj as Record<string, unknown>)[key] === 'number' ||
        (obj as Record<string, unknown>)[key] === undefined),
  );
}

export class GetAnalysisResultDescriptionsListQueryDto {
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

  @Transform(
    ({ value }: TransformFnParams): AnalysisResultDescriptionsFilters => {
      if (!value || typeof value !== 'string') return {};
      try {
        const parsed: unknown = JSON.parse(value);
        return isValidTranslationsFilters(parsed) ? parsed : {};
      } catch {
        return {};
      }
    },
  )
  @IsObject()
  @IsOptional()
  filters: AnalysisResultDescriptionsFilters = {};
}

export class AddNewAnalysisResultDescriptionsQueryDto {
  @IsString()
  description_ru: string;

  @IsArray()
  @IsOptional()
  analysisResultDescriptionConditions: AnalysisResultDescriptionCondition[] =
    [];
}

export class EditAnalysisResultDescriptionsQueryDto extends AddNewAnalysisResultDescriptionsQueryDto {
  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 1;
    return isNaN(num) || num < 1 ? 1 : num;
  })
  @IsNumber()
  @Min(1)
  id: number;
}
