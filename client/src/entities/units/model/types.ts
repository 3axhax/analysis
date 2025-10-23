export interface UnitsListItem {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
}

export interface UnitsState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: UnitsListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
}
