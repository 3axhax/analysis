import { Injectable } from '@nestjs/common';
import {
  AnalysisPointService,
  AnalysisPointWithTranslation,
} from '../analysisPoint/analysisPoint.service';
import { PdfParserService } from '../pdf-parser/pdf-parser.service';

interface FindingPoint {
  id: number;
  name: string;
  value: number;
  unit: number;
}

@Injectable()
export class ParseFileService {
  findingPoints: FindingPoint[] = [];
  pointsList: AnalysisPointWithTranslation[] = [];

  rowDataValueMaxLimit: number = 3000;

  constructor(
    private analysisPointService: AnalysisPointService,
    private readonly pdfParserService: PdfParserService,
  ) {}
  parseFile = async (file: Express.Multer.File) => {
    this.findingPoints = [];

    this.pointsList = (
      await this.analysisPointService.getAllWithTranslation()
    ).sort((a, b) => {
      return a.parsingOrder === b.parsingOrder
        ? a.parsingWords.length > b.parsingWords.length
          ? -1
          : 1
        : a.parsingOrder > b.parsingOrder
          ? -1
          : 1;
    });

    await this.parseBufferByPythonMicroservice(file.buffer);

    return {
      message: 'success',
      findingPoints: this.findingPoints.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      pointsList: this.pointsList,
    };
  };

  async parseBufferByPythonMicroservice(buffer: Buffer) {
    const result = await this.pdfParserService.extractTables(
      buffer,
      'document.pdf',
      {
        pages: '1-5',
        tableSettings: {
          vertical_strategy: 'lines',
          horizontal_strategy: 'lines',
        },
      },
    );
    if (result && result.tables.length > 0) {
      result.tables.forEach((mainTable) => {
        if (mainTable.tables.length > 0) {
          mainTable.tables.forEach((table) => {
            if (table.data.length > 0) {
              table.data.forEach((row) => {
                if (row.length > 0) {
                  let rowDetected: boolean = false;
                  this.pointsList.forEach((point) => {
                    if (rowDetected) return;
                    this._getReferenceList(point).forEach((reference) => {
                      if (this.findReferenceInString(row[0], reference)) {
                        const value =
                          row.length === 1
                            ? this._findNumberAfterSubstring(row[0], reference)
                            : this._findNumberAfterSubstring(row[1], '');
                        if (value > 0 && value < this.rowDataValueMaxLimit) {
                          rowDetected = true;
                          this._addFindingPoints({
                            id: point.id,
                            name: point.name,
                            value,
                            unit: 0,
                          });
                        }
                      }
                    });
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  _addFindingPoints(point: {
    id: number;
    name: string;
    value: number;
    unit: number;
  }) {
    if (!this.findingPoints.find((p) => p.id === point.id)) {
      this.findingPoints.push(point);
    }
  }

  _getReferenceList(point: AnalysisPointWithTranslation): string[] {
    return (
      point.parsingWords !== ''
        ? point.parsingWords.split('_')
        : [point.translationRu, point.translationEn]
    )
      .map((r) => r.trim().toLowerCase())
      .filter((r) => r !== '');
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
    return wordsInString
      ? !!wordsInString.find(
          (word) => reference.toLowerCase() === word.toLowerCase(),
        )
      : false;
  }
}
