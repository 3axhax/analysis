import { GenderType } from "@entities/gender";

export interface PointData {
  name: string;
  value: number;
  units: string;
}

export enum StatusValue {
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

export interface AnalysisResult {
  resultId: string;
  descriptions: ResultDescription[];
}

export interface PreparedData {
  gender: GenderType;
  age: string;
  pointData: {
    [key: string]: PointData;
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
