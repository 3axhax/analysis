import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisResult } from './analysisResult.model';
import * as crypto from 'crypto';
import { AgesService } from '../ages/ages.service';
import { GenderService } from '../gender/gender.service';

export interface SaveResultResponse {
  resultId?: string;
  error?: string;
}

@Injectable()
export class AnalysisResultService {
  constructor(
    @InjectModel(AnalysisResult)
    private analysisResultRepository: typeof AnalysisResult,
    private agesService: AgesService,
    private genderService: GenderService,
  ) {}
  saveResult = async ({
    age: ageName,
    gender: genderName,
  }: {
    age: string;
    gender: string;
  }): Promise<SaveResultResponse> => {
    const resultId = crypto.randomBytes(20).toString('hex');
    console.log('resultId', resultId);
    const age = await this.agesService.getAgeByName(ageName);
    if (!age) {
      return { error: 'Invalid age' };
    }
    const gender = await this.genderService.getGenderByName(genderName);
    if (!gender) {
      return { error: 'Invalid gender' };
    }
    const result = await this.analysisResultRepository.create({
      resultId,
      ageId: age.id as number,
      genderId: gender.id as number,
    });
    return { resultId: result.resultId };
  };
}
