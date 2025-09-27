import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { analysisPointUnitsInitialData } from './analysisPointUnits.initialData';

export interface AnalysisPointUnitsCreationAttrs {
  name: string;
  id?: number;
}

@Table({
  tableName: 'analysisPointUnits',
  timestamps: false,
})
export class AnalysisPointUnits extends Model<
  AnalysisPointUnits,
  AnalysisPointUnitsCreationAttrs
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
    const count = await AnalysisPointUnits.count();
    if (count === 0) {
      await AnalysisPointUnits.bulkCreate(analysisPointUnitsInitialData);
      console.log('Initial Analysis Point Units data added');
    }
  }
}
