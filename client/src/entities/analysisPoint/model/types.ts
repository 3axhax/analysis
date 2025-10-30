export interface AnalysisPointLimit {
  age: string;
  unit: string;
  gender: string;
  minValue: number;
  maxValue: number;
  skipGender?: boolean;
  skipAge?: boolean;
}

export interface AnalysisPointListItem {
  id: number;
  name: string;
  units: string[];
  translationRu: string;
  translationEn: string;
  limits: AnalysisPointLimit[];
}

export interface AnalysisPointState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AnalysisPointListItem[];
  selectedList: number[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
}
