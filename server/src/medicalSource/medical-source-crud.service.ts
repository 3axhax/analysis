import { Injectable } from '@nestjs/common';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointsUnits } from '../analysisPoint/analysisPoint-Units.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';

@Injectable()
export class MedicalSourceCrudService {
  async dictionaries() {
    const [points, ages, genders, units, links] = await Promise.all([
      AnalysisPoint.findAll({
        attributes: ['id', 'name', 'translationRu'],
        order: [['translationRu', 'ASC']],
      }),
      Age.findAll({
        attributes: ['id', 'name'],
        order: [['intervalDayStart', 'ASC']],
      }),
      Gender.findAll({ attributes: ['id', 'name'] }),
      AnalysisPointUnits.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      }),
      AnalysisPointsUnits.findAll({ attributes: ['pointId', 'unitsId'] }),
    ]);
    return { points, ages, genders, units, links };
  }

}
