import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import {
  AnalysisPointService,
  AnalysisPointWithTranslation,
} from '../analysisPoint/analysisPoint.service';

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

  constructor(private analysisPointService: AnalysisPointService) {}
  parseFile = async (file: Express.Multer.File) => {
    this.findingPoints = [];

    this.pointsList = await this.analysisPointService.getAllWithTranslation();

    await this.parseBufferByTables(file.buffer);
    await this.parseBufferByLines(file.buffer);

    return {
      message: 'success',
      findingPoints: this.findingPoints,
      pointsList: this.pointsList,
    };
  };

  async parseBufferByLines(buffer: Buffer) {
    try {
      const parser = new PDFParse({ data: buffer });

      const text = await parser.getText();
      const lines = text.text.split('\n');
      lines.forEach((line, index) => {
        this.pointsList.forEach((point) => {
          const referenceList = (
            point.parsingWords !== ''
              ? point.parsingWords.split(/\s+/)
              : [point.translationRu, point.translationEn]
          )
            .map((r) => r.trim().toLowerCase())
            .filter((r) => r !== '');
          referenceList.forEach((reference) => {
            if (line.toLowerCase().includes(reference)) {
              let value = this._checkLineForValue({
                line,
                reference: reference,
              });
              if (value === 0 && lines[index + 1]) {
                value = this._checkLineForValue({
                  line: lines[index + 1],
                  reference: reference,
                  skipRef: true,
                });
              }
              if (value === 0 && lines[index + 2]) {
                value = this._checkLineForValue({
                  line: lines[index + 2],
                  reference: reference,
                  skipRef: true,
                });
              }
              this._addFindingPoints({
                id: point.id,
                name: point.name,
                value: value,
                unit: 0,
              });
            }
          });
        });
      });
      return { ...text, test: text.text.split('\n') };
    } catch (error) {
      console.log('Ошибка парсинга PDF:', error);
    }
  }

  async parseBufferByTables(buffer: Buffer) {
    try {
      const parser = new PDFParse({ data: buffer });

      const result = await parser.getTable();
      result.pages.forEach((page) => {
        page.tables.forEach((table) => {
          table.forEach((row) => {
            row.forEach((cell, cellIndex) => {
              this.pointsList.forEach((point) => {
                const referenceList = (
                  point.parsingWords !== ''
                    ? point.parsingWords.split(/\s+/)
                    : [point.translationRu, point.translationEn]
                )
                  .map((r) => r.trim().toLowerCase())
                  .filter((r) => r !== '');
                referenceList.forEach((reference) => {
                  if (cell.toLowerCase().includes(reference)) {
                    let value = 0;
                    if (row[cellIndex + 1]) {
                      value = this._checkLineForValue({
                        line: row[cellIndex + 1],
                        reference: reference,
                        skipRef: true,
                      });
                    }

                    this._addFindingPoints({
                      id: point.id,
                      name: point.name,
                      value: value,
                      unit: 0,
                    });
                  }
                });
              });
            });
          });
        });
      });
    } catch (error) {
      console.log('Ошибка парсинга PDF:', error);
    }
  }

  _checkLineForValue({
    line,
    reference,
    skipRef,
  }: {
    line: string;
    reference: string;
    skipRef?: boolean;
  }): number {
    const lineData = line.split(/\s+/);
    let value = 0;
    let isNameFind = skipRef;
    for (const data of lineData) {
      if (isNameFind) {
        value = this._parseNumber(data);
        if (value > 0) {
          break;
        }
      }
      if (!isNameFind && data.toLowerCase().includes(reference)) {
        isNameFind = true;
      }
    }
    return value;
  }

  _parseNumber(str: string) {
    const normalized = str.replace(/\s+/g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
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
}
