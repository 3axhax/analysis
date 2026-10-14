import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';

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
