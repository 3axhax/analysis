import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnalysisResultService,
  GetResultResponse,
  SaveResultResponse,
} from './analysisResult.service';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseFileService } from './parseFile.service';

@Controller('result')
export class AnalysisResultController {
  constructor(
    private AnalysisResultService: AnalysisResultService,
    private ParseFileService: ParseFileService,
  ) {}
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

  @Post('/fromFile')
  @UseInterceptors(FileInterceptor('file'))
  async parseFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<any> {
    return await this.ParseFileService.parseFile(file);
  }
}
