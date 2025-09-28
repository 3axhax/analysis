import { Body, Controller, Post } from '@nestjs/common';
import {
  AnalysisResultService,
  SaveResultResponse,
} from './analysisResult.service';

@Controller('result')
export class AnalysisResultController {
  constructor(private AnalysisResultService: AnalysisResultService) {}
  @Post('/save')
  async saveResult(
    @Body('age') age: string,
    @Body('gender') gender: string,
  ): Promise<SaveResultResponse> {
    if (!age || !gender) {
      return { error: 'No required parameters: age, gender' };
    }
    return this.AnalysisResultService.saveResult({ age, gender });
  }
}
