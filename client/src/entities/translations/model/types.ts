export interface TranslationsListItem {
  id: number;
  lang: string;
  namespace: string;
  module: string;
  submodule: string | null;
  value: string;
}

export interface TranslationsState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: TranslationsListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
}
