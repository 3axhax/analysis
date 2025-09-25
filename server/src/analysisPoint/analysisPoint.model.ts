import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { analysisPointInitialData } from './analysisPoint.initialData';

export interface AnalysisPointCreationAttrs {
  name: string;
  description: string;
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
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
  })
  declare description: string;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisPoint.count();
    if (count === 0) {
      await AnalysisPoint.bulkCreate(analysisPointInitialData);
      console.log('Initial Analysis Point data added');
    }
  }
}
