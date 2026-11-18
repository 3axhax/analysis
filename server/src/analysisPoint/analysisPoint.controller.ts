import { Controller, Get } from '@nestjs/common';
import { AnalysisPointService } from './analysisPoint.service';

@Controller('analysisPoint')
export class AnalysisPointController {
  constructor(private readonly points: AnalysisPointService) {}
  @Get()
  getAll() { return this.points.getAll(); }
}
