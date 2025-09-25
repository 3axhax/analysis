import { Controller, Get } from '@nestjs/common';
import { AnalysisTypeService } from './analysisType.service';

@Controller('analysisType')
export class AnalysisTypeController {
  constructor(private AnalysisTypeService: AnalysisTypeService) {}
  @Get()
  getAll() {
    return this.AnalysisTypeService.getAll();
  }
}
