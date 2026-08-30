import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AnalysisPointService } from '../analysisPoint/analysisPoint.service';
import { PdfParserService } from '../pdf-parser/pdf-parser.service';
import {
  HybridPdfFindingMatcher,
  LegacyPdfFindingMatcher,
  StructuredPdfFindingMatcher,
} from './pdf-finding-matcher';
import { PdfMatcherResult, PdfParsingFinding } from './pdf-matching.types';

export type ParsingStatus = 'complete' | 'partial' | 'unsupported';
export type ParsingFinding = PdfParsingFinding;
type PdfMatcherMode = 'legacy' | 'shadow' | 'structured' | 'hybrid';

export interface ParsingFileResponse {
  status: ParsingStatus;
  findings: ParsingFinding[];
  warnings: string[];
  stats: {
    pagesTotal: number;
    pagesProcessed: number;
    pagesOcr: number;
    candidates: number;
    matched: number;
  };
}

@Injectable()
export class ParseFileService {
  private readonly logger = new Logger(ParseFileService.name);
  private readonly legacyMatcher = new LegacyPdfFindingMatcher();
  private readonly structuredMatcher = new StructuredPdfFindingMatcher();
  private readonly hybridMatcher = new HybridPdfFindingMatcher();
  private activeRequests = 0;
  private readonly maxConcurrentRequests = 2;

  constructor(
    private readonly analysisPointService: AnalysisPointService,
    private readonly pdfParserService: PdfParserService,
  ) {}

  async parseFile(file: Express.Multer.File): Promise<ParsingFileResponse> {
    if (this.activeRequests >= this.maxConcurrentRequests) {
      throw new HttpException(
        'Too many PDF requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.activeRequests += 1;
    try {
      const points = await this.analysisPointService.getAllWithTranslation();
      const extraction = await this.pdfParserService.extractTables(
        file.buffer,
        {
          pages: '1-5',
          tableSettings: {
            vertical_strategy: 'lines',
            horizontal_strategy: 'lines',
          },
        },
      );
      const mode = this.getMatcherMode();
      const legacy = this.legacyMatcher.match(extraction, points);
      let selected = legacy;

      if (mode === 'hybrid') {
        selected = this.hybridMatcher.match(extraction, points);
      } else if (mode !== 'legacy') {
        const structured = this.structuredMatcher.match(extraction, points);
        if (mode === 'structured') {
          selected = structured;
        } else {
          this.logShadowComparison(legacy, structured);
        }
      }

      const warnings = [...selected.warnings];
      if (extraction.total_pages > extraction.pages_processed) {
        warnings.push('page_limit_reached');
      }
      const uniqueWarnings = [...new Set(warnings)];
      const hasFindingWarnings = selected.findings.some(
        (finding) => finding.warnings.length > 0,
      );
      return {
        status:
          selected.findings.length === 0
            ? 'unsupported'
            : uniqueWarnings.length > 0 || hasFindingWarnings
              ? 'partial'
              : 'complete',
        findings: [...selected.findings].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        warnings: uniqueWarnings,
        stats: {
          pagesTotal: extraction.total_pages,
          pagesProcessed: extraction.pages_processed,
          pagesOcr: extraction.pages_ocr,
          candidates: selected.stats.logicalRows,
          matched: selected.findings.length,
        },
      };
    } finally {
      this.activeRequests -= 1;
    }
  }

  private getMatcherMode(): PdfMatcherMode {
    const configured = process.env.PDF_MATCHER_MODE;
    if (
      configured === 'structured' ||
      configured === 'shadow' ||
      configured === 'hybrid'
    ) {
      return configured;
    }
    return 'legacy';
  }

  private logShadowComparison(
    legacy: PdfMatcherResult,
    structured: PdfMatcherResult,
  ): void {
    this.logger.log({
      event: 'pdf_matcher_shadow_comparison',
      legacyMatched: legacy.findings.length,
      structuredMatched: structured.findings.length,
      structuredAmbiguous: structured.stats.ambiguous,
      logicalRows: structured.stats.logicalRows,
    });
  }
}
