import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { analysisPointMaxValueInitialData } from './analysisPointMaxValue.initialData';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';

export interface AnalysisPointMaxValueCreationAttrs {
  id?: number;
  pointId: number;
  ageId: number;
  genderId: number;
  unitId: number;
  value: number;
}

@Table({
  tableName: 'analysisPointMaxValue',
  timestamps: false,
})
export class AnalysisPointMaxValue extends Model<
  AnalysisPointMaxValue,
  AnalysisPointMaxValueCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @ForeignKey(() => Age)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare ageId: number;

  @ForeignKey(() => Gender)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare genderId: number;

  @ForeignKey(() => AnalysisPointUnits)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare unitId: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare value: number;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisPointMaxValue.count();
    if (count === 0) {
      await AnalysisPointMaxValue.bulkCreate(analysisPointMaxValueInitialData);
    }
  }
}
