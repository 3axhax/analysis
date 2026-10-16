// pdf-parser/pdf-parser.service.ts
import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import axios from 'axios';
import {
  ExtractTablesOptions,
  ExtractTablesResponse,
} from './pdf-parser.types';

@Injectable()
export class PdfParserService {
  private readonly pdfParserUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.pdfParserUrl =
      process.env.PDF_PARSER_URL || 'http://python_pdf_parser:8000';
  }

  async extractTables(
    fileBuffer: Buffer,
    options?: ExtractTablesOptions,
  ): Promise<ExtractTablesResponse> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: 'document.pdf',
        contentType: 'application/pdf',
      });

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
          maxBodyLength: 10 * 1024 * 1024,
          maxContentLength: 5 * 1024 * 1024,
          timeout: 50000,
        }),
      );

      return response.data as ExtractTablesResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && [400, 413, 422].includes(status)) {
          throw new HttpException('PDF cannot be processed', status);
        }
      }
      throw new ServiceUnavailableException('PDF parser is unavailable');
    }
  }
}
