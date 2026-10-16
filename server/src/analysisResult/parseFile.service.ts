import {
  HttpException,
  HttpStatus,
  Injectable,
  Optional,
} from '@nestjs/common';
import { AnalysisPointService } from '../analysisPoint/analysisPoint.service';
import { PdfParserService } from '../pdf-parser/pdf-parser.service';
import { LegacyPdfFindingMatcher } from './pdf-finding-matcher';
import { PdfParsingFinding } from './pdf-matching.types';
import { AnalysisPointUnitsService } from '../analysisPointUnits/analysisPointUnits.service';

export type ParsingStatus = 'complete' | 'partial' | 'unsupported';
export type ParsingFinding = PdfParsingFinding;

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
  private readonly legacyMatcher = new LegacyPdfFindingMatcher();
  private activeRequests = 0;
  private readonly maxConcurrentRequests = 2;

  constructor(
    private readonly analysisPointService: AnalysisPointService,
    private readonly pdfParserService: PdfParserService,
    @Optional() private readonly unitsService?: AnalysisPointUnitsService,
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
      const unitCatalog = this.unitsService
        ? ((await this.unitsService.getAll()) ?? [])
        : undefined;
      const selected = this.legacyMatcher.match(
        extraction,
        points,
        unitCatalog,
      );

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
}
