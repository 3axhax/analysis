export interface DescriptionCondition {
  id: number;
  analysisPoint: { name: string };
  status: string;
}

export interface DescriptionsListItem {
  id: number;
  description_ru: string;
  analysisResultDescriptionConditions: DescriptionCondition[];
}

export interface DescriptionsState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: DescriptionsListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
  editDescriptionId: number;
}
