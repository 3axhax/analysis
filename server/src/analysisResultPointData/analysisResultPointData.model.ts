import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisResult } from '../analysisResult/analysisResult.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

export interface AnalysisResultPointDataAttrs {
  resultId: number;
  pointId: number;
  value: number;
  unitId: number;
}
@Table({
  tableName: 'analysisResultPointData',
  timestamps: false,
})
export class AnalysisResultPointData extends Model<
  AnalysisResultPointData,
  AnalysisResultPointDataAttrs
> {
  @ForeignKey(() => AnalysisResult)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare resultId: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare value: number;

  @ForeignKey(() => AnalysisPointUnits)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare unitId: number;
}
