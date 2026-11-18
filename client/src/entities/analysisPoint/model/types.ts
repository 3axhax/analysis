export interface AnalysisPointListItem {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  units: string[];
}
export interface AnalysisPointState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AnalysisPointListItem[];
}
