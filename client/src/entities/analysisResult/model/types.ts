import { GenderType } from "@entities/gender";

export interface PointData {
  name: string;
  value: number;
  units: string;
}

export interface AnalysisResult {
  resultId: string;
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
}
