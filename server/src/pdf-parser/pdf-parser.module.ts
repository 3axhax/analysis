// pdf-parser/pdf-parser.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PdfParserService } from './pdf-parser.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 секунд на парсинг больших PDF
      maxRedirects: 5,
    }),
  ],
  providers: [PdfParserService],
  exports: [PdfParserService],
})
export class PdfParserModule {}
