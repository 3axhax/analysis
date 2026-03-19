import { GenderType } from "@shared/lib/types";

export interface AnalysisPointLimit {
  age: string[];
  unit: string;
  gender: GenderType[];
  minValue: number;
  maxValue: number;
  skipGender?: boolean;
  skipAge?: boolean;
}

export interface AnalysisPointGreatItem {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  parsingWords: string;
  limits: AnalysisPointLimit[];
}

export interface AnalysisPointFormatedLimit
  extends Omit<AnalysisPointLimit, "age" | "gender"> {
  age: string;
  gender: GenderType;
}

export interface AnalysisPointGreatItemFormated
  extends Omit<AnalysisPointGreatItem, "limits"> {
  limits: AnalysisPointFormatedLimit[];
}

export interface AnalysisPointListItem extends AnalysisPointGreatItemFormated {
  units: string[];
}

export interface AnalysisPointState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AnalysisPointListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
  editAnalysisPointId: number;
}
