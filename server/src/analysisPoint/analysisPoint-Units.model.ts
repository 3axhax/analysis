import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisPoint } from './analysisPoint.model';
import { analysisPointsUnitsInitialData } from './analysisPoint-Units.initialData';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

export interface AnalysisPointsUnitsCreationAttrs {
  pointId: number;
  unitsId: number;
}
@Table({
  tableName: 'analysis_point_units',
  timestamps: false,
})
export class AnalysisPointsUnits extends Model<
  AnalysisPointsUnits,
  AnalysisPointsUnitsCreationAttrs
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

  @ForeignKey(() => AnalysisPointUnits)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare unitsId: number;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisPointsUnits.count();
    if (count === 0) {
      await AnalysisPointsUnits.bulkCreate(analysisPointsUnitsInitialData);
    }
  }
}
