import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisResult } from './analysisResult.model';

export interface AnalysisResultPointDataAttrs {
  resultId: string;
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare unitId: number;
}
