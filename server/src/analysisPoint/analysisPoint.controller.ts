import { Controller, Get } from '@nestjs/common';
import { AnalysisPointService } from './analysisPoint.service';

@Controller('analysisPoint')
export class AnalysisPointController {
  constructor(private AnalysisPointService: AnalysisPointService) {}
  @Get()
  getAll() {
    return this.AnalysisPointService.getAll();
  }
}
