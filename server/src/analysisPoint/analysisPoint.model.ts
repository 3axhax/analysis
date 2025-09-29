import {
  AfterSync,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { analysisPointInitialData } from './analysisPoint.initialData';
import { AnalysisPointsUnits } from './analysisPoint-Units.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

export interface AnalysisPointCreationAttrs {
  name: string;
  id?: number;
}

@Table({
  tableName: 'analysisPoint',
  timestamps: false,
})
export class AnalysisPoint extends Model<
  AnalysisPoint,
  AnalysisPointCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare name: string;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisPoint.count();
    if (count === 0) {
      await AnalysisPoint.bulkCreate(analysisPointInitialData);
    }
  }

  @BelongsToMany(() => AnalysisPointUnits, () => AnalysisPointsUnits)
  declare units: AnalysisPointUnits[];
}
