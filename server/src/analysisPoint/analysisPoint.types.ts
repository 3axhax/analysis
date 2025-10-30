export interface AnalysisPointLimit {
  age: string;
  unit: string;
  gender: string;
  minValue: number;
  maxValue: number;
}

export interface AnalysisPointResponse {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  limits: AnalysisPointLimit[];
}

export interface AnalysisPointsListResponse {
  totalRecord: number;
  currentPage: number;
  rows: AnalysisPointResponse[];
}
