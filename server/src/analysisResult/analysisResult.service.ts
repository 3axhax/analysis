import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AnalysisResult } from './analysisResult.model';
import * as crypto from 'crypto';
import { AgesService } from '../ages/ages.service';
import { GenderService } from '../gender/gender.service';
import { AnalysisPointService } from '../analysisPoint/analysisPoint.service';
import { AnalysisPointUnitsService } from '../analysisPointUnits/analysisPointUnits.service';
import { AnalysisResultPointDataService } from '../analysisResultPointData/analysisResultPointData.service';
import { AnalysisResultDescriptionService } from '../analysisResultDescription/analysisResultDescription.service';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { AnalysisPointMinValueService } from '../analysisPointMinValue/analysisPointMinValue.service';
import { AnalysisPointMaxValueService } from '../analysisPointMaxValue/analysisPointMaxValue.service';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';
import { User } from '../users/users.model';

export interface SaveResultResponse {
  resultId?: string;
  error?: string;
}

export interface GetResultResponse {
  resultId?: string;
  error?: string;
  result?: AnalysisResult | null;
  descriptions?: AnalysisResultDescription[];
}

@Injectable()
export class AnalysisResultService {
  constructor(
    @InjectModel(AnalysisResult)
    private analysisResultRepository: typeof AnalysisResult,
    private agesService: AgesService,
    private genderService: GenderService,
    private analysisPointService: AnalysisPointService,
    private analysisPointUnitsService: AnalysisPointUnitsService,
    private analysisResultPointDataService: AnalysisResultPointDataService,
    private analysisResultDescriptionService: AnalysisResultDescriptionService,
    private analysisPointMinValueService: AnalysisPointMinValueService,
    private analysisPointMaxValueService: AnalysisPointMaxValueService,
  ) {}
  saveResult = async ({
    age: ageName,
    gender: genderName,
    pointData,
    user,
  }: {
    age: string;
    gender: string;
    pointData: { name: string; value: number; units: string }[];
    user: User | undefined;
  }): Promise<SaveResultResponse> => {
    const resultId = crypto.randomBytes(20).toString('hex');
    const age = await this.agesService.getAgeByName(ageName);
    if (!age) {
      return { error: 'Invalid age' };
    }
    const gender = await this.genderService.getGenderByName(genderName);
    if (!gender) {
      return { error: 'Invalid gender' };
    }

    const result: AnalysisResult = await this.analysisResultRepository.create({
      resultId,
      ageId: age.id as number,
      genderId: gender.id as number,
      userId: user ? user.id : null,
    });

    await Promise.all(
      pointData.map(async (item) => {
        const point = await this.analysisPointService.getAnalysisPointByName(
          item.name,
        );
        const units =
          await this.analysisPointUnitsService.getAnalysisPointUnitsByName(
            item.units,
          );
        if (point && units && item.value > 0) {
          await this.analysisResultPointDataService.savePointData({
            resultId: result.id,
            pointId: point.id,
            value: item.value,
            unitId: units.id,
          });
        }
      }),
    );

    return { resultId: result.resultId };
  };

  getResultByResultId = async ({
    resultId,
  }: {
    resultId: string;
  }): Promise<GetResultResponse> => {
    const result = await this.analysisResultRepository.findOne({
      where: { resultId },
      include: [
        {
          model: AnalysisResultPointData,
          include: [{ model: AnalysisPoint }, { model: AnalysisPointUnits }],
        },
        { model: Age },
        { model: Gender },
      ],
    });
    if (!result) {
      return { resultId, result: null, descriptions: [] };
    }
    const plainResult = result.get({ plain: true });
    plainResult.analysisResultPointData = await Promise.all(
      plainResult.analysisResultPointData.map(async (pointData) => {
        pointData.minValue =
          await this.analysisPointMinValueService.getMinValueByPointGenderAge({
            pointId: pointData.pointId,
            ageId: plainResult.ageId,
            genderId: plainResult.genderId,
          });
        pointData.maxValue =
          await this.analysisPointMaxValueService.getMaxValueByPointGenderAge({
            pointId: pointData.pointId,
            ageId: plainResult.ageId,
            genderId: plainResult.genderId,
          });
        pointData.pointDataStatus =
          pointData.value > pointData.maxValue
            ? StatusValue.HIGH
            : pointData.value < pointData.minValue
              ? StatusValue.LOW
              : StatusValue.NORMAL;
        return pointData;
      }),
    );

    const descriptions = result
      ? await this.analysisResultDescriptionService.getDescriptionByResult(
          result,
        )
      : [];

    return { resultId: result?.resultId, result: plainResult, descriptions };
  };
}
