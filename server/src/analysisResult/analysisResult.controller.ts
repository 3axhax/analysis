import { Body, Controller, Post } from '@nestjs/common';
import {
  AnalysisResultService,
  GetResultResponse,
  SaveResultResponse,
} from './analysisResult.service';

@Controller('result')
export class AnalysisResultController {
  constructor(private AnalysisResultService: AnalysisResultService) {}
  @Post('/save')
  async saveResult(
    @Body('age') age: string,
    @Body('gender') gender: string,
    @Body('pointData') pointData: [],
  ): Promise<SaveResultResponse> {
    if (!age || !gender) {
      return { error: 'No required parameters: age, gender' };
    }
    return this.AnalysisResultService.saveResult({ age, gender, pointData });
  }

  @Post('/get')
  async getResult(
    @Body('resultId') resultId: string,
  ): Promise<GetResultResponse> {
    if (!resultId) {
      return { error: 'No required parameters: resultId' };
    }
    const analysisResult = this.AnalysisResultService.getResultByResultId({
      resultId,
    });
    if (analysisResult === null) {
      return { error: 'No result found' };
    } else {
      return await analysisResult;
    }
  }
}
