export interface AnalysisPointListItem {
  id: number;
  name: string;
  units: string[];
  translationRu: string;
  translationEn: string;
  limits: {
    age: string;
    unit: string;
    gender: string;
    minValue: number;
    maxValue: number;
  }[];
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
