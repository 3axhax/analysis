export interface DescriptionCondition {
  id?: number;
  analysisPoint: { id: number; name: string };
  status: string;
}

export interface DescriptionsListItem {
  id: number;
  description_ru: string;
  deRitisRule?: string | null;
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
  adminRequestId: string | null;
}

export interface DescriptionGreatItem {
  id: number;
  description_ru: string;
  deRitisRule?: string | null;
  analysisResultDescriptionConditions: DescriptionCondition[];
}
