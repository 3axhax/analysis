import { Transform, TransformFnParams } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

interface AnalysisResultDescriptionsFilters {
  name?: string;
  translationRu?: string;
  translationEn?: string;
}

function isValidTranslationsFilters(
  obj: unknown,
): obj is AnalysisResultDescriptionsFilters {
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
  name: string;

  @IsString()
  translationRu: string;

  @IsString()
  translationEn: string;
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
