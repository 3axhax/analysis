// pdf-parser/pdf-parser.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { ExtractTablesResponse } from './pdf-parser.types';

@Injectable()
export class PdfParserService {
  private readonly pdfParserUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.pdfParserUrl =
      process.env.PDF_PARSER_URL || 'http://python_pdf_parser:8000';
  }

  async extractTables(
    fileBuffer: Buffer,
    filename: string = 'document.pdf',
    options?: {
      pages?: string;
      tableSettings?: Record<string, any>;
    },
  ): Promise<ExtractTablesResponse | null> {
    try {
      // Создаем FormData
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename });

      if (options?.pages) {
        formData.append('pages', options.pages);
      }

      if (options?.tableSettings) {
        formData.append(
          'table_settings',
          JSON.stringify(options.tableSettings),
        );
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.pdfParserUrl}/extract-tables`, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 60000,
        }),
      );

      return response.data as ExtractTablesResponse;
    } catch (error) {
      console.error('PDF Parser Service Error:', error);
    }
    return null;
  }
}
