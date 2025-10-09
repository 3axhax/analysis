import { GenderType } from "@entities/gender";

interface PreparePointData {
  name: string;
  value: number;
  units: string;
}

export enum StatusValue {
  NORMAL = "-1",
  LOW = "0",
  HIGH = "1",
}

export interface AnalysisResultDescriptionCondition {
  id: number;
  analysisPoint: {
    id: number;
    name: string;
  };
  status: StatusValue;
}

export interface ResultDescription {
  id: number;
  description_ru: string;
  analysisResultDescriptionConditions: AnalysisResultDescriptionCondition[];
}

export interface PointData {
  id: number;
  point: { id: number; name: string };
  pointUnit: { id: number; name: string };
  value: number;
  minValue: number;
  maxValue: number;
  pointDataStatus: StatusValue;
}

interface Result {
  Age: { id: number; name: string };
  Gender: { id: number; name: string };
  analysisResultPointData: PointData[];
}

export interface AnalysisResult {
  resultId: string;
  descriptions: ResultDescription[];
  result: Result;
}

export interface PreparedData {
  gender: GenderType;
  age: string;
  pointData: {
    [key: string]: PreparePointData;
  };
}

export interface AnalysisResultState {
  pending: boolean;
  error: string;
  preparedData: PreparedData;
  results: {
    [key: string]: AnalysisResult;
  };
  redirectTo?: string;
}
