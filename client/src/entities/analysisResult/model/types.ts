import { GenderType } from "@shared/lib/types";

export interface PreparePointData {
  name: string;
  value: number;
  units: string;
  sourceUnitText?: string;
  unitWasDefaulted?: boolean;
}

export enum StatusValue {
  NORMAL = "-1",
  LOW = "0",
  HIGH = "1",
  OPTIMUM = "2",
}

export interface AnalysisResultDescriptionCondition {
  id: number;
  analysisPoint: {
    id: number;
    name: string;
  };
  status: StatusValue | null;
}

export interface ResultDescription {
  id: number;
  description_ru: string;
  analysisResultDescriptionConditions: AnalysisResultDescriptionCondition[];
}

export interface PointData {
  id: number;
  isCalculated?: boolean;
  displayValue?: string;
  point: {
    id: number;
    name: string;
    translationRu: string;
    translationEn: string;
    pointHintRu: string | null;
    pointHintEn: string | null;
  };
  pointUnit: { id: number; name: string };
  value: number;
  minValue: number | null;
  maxValue: number | null;
  pointDataStatus: StatusValue | null;
  matchingIntervals?: {
    id: number;
    status: "LOW" | "NORMAL" | "HIGH" | "OPTIMUM" | null;
    sourceId: number | null;
    source: SourceDescriptionGroup["source"] | null;
    minValue: string | null;
    maxValue: string | null;
    minValueEqual: boolean | null;
    maxValueEqual: boolean | null;
    unit: string | null;
    sourceName: string | null;
  }[];
  displayReferences?: {
    id: number;
    status: "NORMAL" | "OPTIMUM";
    sourceId: number | null;
    source: SourceDescriptionGroup["source"] | null;
    minValue: string | null;
    maxValue: string | null;
    minValueEqual: boolean | null;
    maxValueEqual: boolean | null;
    minApproximate?: boolean;
    maxApproximate?: boolean;
  }[];
  sourceUnitText?: string;
  interpretationWarning?: string | null;
  calculation?: {
    value: string;
    unitId: number;
    unit: string;
    coefficient: string;
    ruleId: number | null;
    ruleVersion: number | null;
    minValue: string;
    maxValue: string;
  };
}

interface Result {
  Gender: { id: number; name: string };
  ageInDays: number;
  analysisResultPointData: PointData[];
}

export interface SourceDescriptionGroup {
  source: { id: number; name: string; url: string | null; year: number | null; metadata: Record<string, unknown>; rootId: number; rootName: string };
  descriptions: ResultDescription[];
  inheritedPointIds: number[];
}

export interface AnalysisResult {
  resultId: string;
  descriptions: ResultDescription[];
  sourceDescriptions?: SourceDescriptionGroup[];
  result: Result;
}

export interface PreparedData {
  gender: GenderType;
  ageInDays: number;
  pointData: Record<string, PreparePointData>;
}

export interface AnalysisResultState {
  pending: boolean;
  error: string;
  preparedData: PreparedData;
  results: Record<string, AnalysisResult>;
  redirectTo?: string;
  selectedList: number[];
}

export interface AnalysisParsingFileResult {
  status: "complete" | "partial" | "unsupported";
  findings: {
    id: number;
    name: string;
    unitId: number | null;
    unit: string | null;
    unitText?: string | null;
    value: number;
    confidence: number;
    page: number;
    warnings: string[];
  }[];
  warnings: string[];
  stats: {
    pagesTotal: number;
    pagesProcessed: number;
    pagesOcr: number;
    candidates: number;
    matched: number;
  };
}
