import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import {
  ExtractTablesResponse,
  ExtractionMethod,
} from '../pdf-parser/pdf-parser.types';

export type PdfAliasSource = 'primary' | 'translationRu' | 'translationEn';

export interface PdfParsingFinding {
  id: number;
  name: string;
  value: number;
  unitId: number | null;
  unit: string | null;
  confidence: number;
  page: number;
  warnings: string[];
}

export interface PdfMatcherStats {
  candidateRows: number;
  logicalRows: number;
  pointCandidates: number;
  ambiguous: number;
}

export interface PdfMatcherResult {
  findings: PdfParsingFinding[];
  warnings: string[];
  stats: PdfMatcherStats;
}

export interface PdfFindingMatcher {
  match(
    extraction: ExtractTablesResponse,
    points: AnalysisPointWithTranslation[],
  ): PdfMatcherResult;
}

export interface PdfAliasEntry {
  point: AnalysisPointWithTranslation;
  source: PdfAliasSource;
  raw: string;
  canonicalKey: string;
  tolerantKey: string;
  short: boolean;
  canonicalCollision: boolean;
  tolerantCollision: boolean;
}

export interface PdfColumnRoles {
  name?: number;
  result?: number;
  unit?: number;
  reference: number[];
  explicit: boolean;
}

export interface PdfLogicalRow {
  page: number;
  cells: string[];
  canonicalCells: string[];
  methods: Set<ExtractionMethod>;
  roles: PdfColumnRoles;
}
