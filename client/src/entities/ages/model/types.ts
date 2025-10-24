export interface AgesListItem {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
}

export interface AgesState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AgesListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
}
