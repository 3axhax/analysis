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
    console.log('Получен файл:', file.originalname);

    this.pointsList = await this.analysisPointService.getAllWithTranslation();

    await this.parseBufferByLines(file.buffer);

    return {
      message: 'success',
      filename: file.originalname,
      size: file.size,
      findingPoints: this.findingPoints,
      pointsList: this.pointsList,
      data: await this.parseTablesFromBuffer(file.buffer),
    };
  };

  async parseBufferByLines(buffer) {
    try {
      const parser = new PDFParse({ data: buffer });

      const text = await parser.getText();
      console.log(text);
      const lines = text.text.split('\n');
      lines.forEach((line, index) => {
        this.pointsList.forEach((point) => {
          if (line.includes(point.translationRu)) {
            let value = this._checkLineForValue({
              line,
              reference: point.translationRu,
            });
            if (value === 0 && lines[index + 1]) {
              value = this._checkLineForValue({
                line: lines[index + 1],
                reference: point.translationRu,
                skipRef: true,
              });
            }
            if (value === 0 && lines[index + 2]) {
              value = this._checkLineForValue({
                line: lines[index + 2],
                reference: point.translationRu,
                skipRef: true,
              });
            }
            this.findingPoints.push({
              id: point.id,
              name: point.name,
              value: value,
              unit: 0,
            });
          }
        });
      });
      console.log(this.findingPoints);
      return { ...text, test: text.text.split('\n') };
    } catch (error) {
      console.log('Ошибка парсинга PDF:', error);
    }
  }

  async parseTablesFromBuffer(buffer) {
    try {
      const parser = new PDFParse({ data: buffer });

      const result = await parser.getText();
      return result;
    } catch (error) {
      console.log('Ошибка парсинга PDF:', error);
      throw error;
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
    console.log(lineData);
    let value = 0;
    let isNameFind = skipRef;
    for (const [index, data] of lineData.entries()) {
      if (isNameFind) {
        value = this._parseNumber(data);
        if (value > 0) {
          console.log(
            'name: ',
            reference,
            'value: ',
            value,
            'unit: ',
            lineData[index + 1],
          );
          break;
        }
      }
      if (!isNameFind && data.includes(reference)) {
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
}
