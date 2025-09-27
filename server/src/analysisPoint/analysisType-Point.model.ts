import { AnalysisType } from '../analysisType/analysisType.model';
import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisPoint } from './analysisPoint.model';
import { analysisTypePointInitialData } from './analysisType-Point.initialData';

export interface AnalysisTypePointCreationAttrs {
  typeId: number;
  pointId: number;
}
@Table({
  tableName: 'analysis_type_point',
  createdAt: false,
  updatedAt: false,
})
export class AnalysisTypePoint extends Model<
  AnalysisTypePoint,
  AnalysisTypePointCreationAttrs
> {
  @ForeignKey(() => AnalysisType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare typeId: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisTypePoint.count();
    if (count === 0) {
      await AnalysisTypePoint.bulkCreate(analysisTypePointInitialData);
      console.log('Initial Analysis Type Point data added');
    }
  }
}
