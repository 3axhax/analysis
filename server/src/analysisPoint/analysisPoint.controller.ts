import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AnalysisPointService } from './analysisPoint.service';

import { ArticleInterpretationsService } from './article-interpretations.service';

@Controller('analysisPoint')
export class AnalysisPointController {
  constructor(
    private readonly points: AnalysisPointService,
    private readonly interpretations: ArticleInterpretationsService,
  ) {}
  @Get()
  getAll() { return this.points.getAll(); }

  @Get(':pointId/interpretations')
  getInterpretations(@Param('pointId', ParseIntPipe) pointId: number) {
    return this.interpretations.getForPoint(pointId);
  }
}
