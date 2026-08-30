import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AnalysisPointService,
  AnalysisPointWithTranslation,
} from '../analysisPoint/analysisPoint.service';
import { PdfParserService } from '../pdf-parser/pdf-parser.service';
import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';

export type ParsingStatus = 'complete' | 'partial' | 'unsupported';

export interface ParsingFinding {
  id: number;
  name: string;
  value: number;
  unitId: number | null;
  unit: string | null;
  confidence: number;
  page: number;
  warnings: string[];
}

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

interface LegacyFinding {
  id: number;
  name: string;
  value: number;
}

@Injectable()
export class ParseFileService {
  private activeRequests = 0;
  private readonly maxConcurrentRequests = 2;
  private readonly rowDataValueMaxLimit = 3000;

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
      const points = (
        await this.analysisPointService.getAllWithTranslation()
      ).sort((a, b) =>
        a.parsingOrder === b.parsingOrder
          ? b.parsingWords.length - a.parsingWords.length
          : b.parsingOrder - a.parsingOrder,
      );
      const extraction = await this.pdfParserService.extractTables(file.buffer, {
        pages: '1-5',
        tableSettings: {
          vertical_strategy: 'lines',
          horizontal_strategy: 'lines',
        },
      });
      const legacy = this.findLegacyFindings(extraction, points);
      const warnings: string[] = [];
      if (extraction.total_pages > extraction.pages_processed) {
        warnings.push('page_limit_reached');
      }
      if (legacy.findings.length === 0) {
        warnings.push('no_supported_findings');
      }
      const findings: ParsingFinding[] = legacy.findings
        .map((finding) => ({
          ...finding,
          unitId: null,
          unit: null,
          confidence: 0.5,
          page: legacy.pages.get(finding.id) ?? 1,
          warnings: [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        status:
          findings.length === 0
            ? 'unsupported'
            : warnings.length > 0
              ? 'partial'
              : 'complete',
        findings,
        warnings,
        stats: {
          pagesTotal: extraction.total_pages,
          pagesProcessed: extraction.pages_processed,
          pagesOcr: extraction.pages_ocr,
          candidates: legacy.candidateRows,
          matched: findings.length,
        },
      };
    } finally {
      this.activeRequests -= 1;
    }
  }

  private findLegacyFindings(
    extraction: ExtractTablesResponse,
    points: AnalysisPointWithTranslation[],
  ): {
    findings: LegacyFinding[];
    pages: Map<number, number>;
    candidateRows: number;
  } {
    const findings: LegacyFinding[] = [];
    const pages = new Map<number, number>();
    let candidateRows = 0;
    for (const page of extraction.tables) {
      for (const table of page.tables) {
        for (const row of table.data) {
          candidateRows += 1;
          if (row.length === 0) continue;
          let rowDetected = false;
          for (const point of points) {
            if (rowDetected) break;
            for (const reference of this._getReferenceList(point)) {
              if (!this.findReferenceInString(row[0], reference)) continue;
              const value =
                row.length === 1
                  ? this._findNumberAfterSubstring(row[0], reference)
                  : this._findNumberAfterSubstring(row[1] ?? '', '');
              if (value > 0 && value < this.rowDataValueMaxLimit) {
                rowDetected = true;
                if (!findings.some((item) => item.id === point.id)) {
                  findings.push({ id: point.id, name: point.name, value });
                  pages.set(point.id, page.page);
                }
                break;
              }
            }
          }
        }
      }
    }
    return { findings, pages, candidateRows };
  }

  _getReferenceList(point: AnalysisPointWithTranslation): string[] {
    return (
      point.parsingWords !== ''
        ? point.parsingWords.split('_')
        : [point.translationRu, point.translationEn]
    )
      .map((reference) => reference.trim().toLowerCase())
      .filter((reference) => reference !== '');
  }

  _findNumberAfterSubstring(text: string, searchString: string): number {
    const searchIndex =
      searchString !== ''
        ? text.toLowerCase().indexOf(searchString.toLowerCase())
        : 0;
    if (searchIndex === -1) return 0;
    const match = text
      .slice(searchIndex + searchString.length)
      .match(/(\d+[.,]\d+|\d+)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(',', '.'));
  }

  findReferenceInString(string: string, reference: string): boolean {
    if (reference.includes(' ')) {
      return string.toLowerCase().includes(reference.toLowerCase());
    }
    const wordsInString = string.split(/[\s()[\]{}\n]/).filter(Boolean);
    return wordsInString.some(
      (word) => reference.toLowerCase() === word.toLowerCase(),
    );
  }
}
