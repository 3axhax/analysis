import { Body, Controller, Post } from '@nestjs/common';
import {
  AnalysisResultService,
  GetResultResponse,
  SaveResultResponse,
} from './analysisResult.service';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';

@Controller('result')
export class AnalysisResultController {
  constructor(private AnalysisResultService: AnalysisResultService) {}
  @Post('/save')
  async saveResult(
    @Body('age') age: string,
    @Body('gender') gender: string,
    @Body('pointData') pointData: [],
    @User() user: UserModel | undefined,
  ): Promise<SaveResultResponse> {
    if (!age || !gender) {
      return { error: 'No required parameters: age, gender' };
    }
    return this.AnalysisResultService.saveResult({
      age,
      gender,
      pointData,
      user,
    });
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
