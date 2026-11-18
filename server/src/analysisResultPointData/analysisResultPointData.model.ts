import {
  BelongsTo,
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
  sourceValue?: string | null;
  sourceUnitId?: number | null;
  sourceUnitText?: string | null;

}
@Table({
  tableName: 'analysisResultPointData',
  timestamps: false,
})
export class AnalysisResultPointData extends Model<
  AnalysisResultPointData,
  AnalysisResultPointDataAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

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

  @Column({ type: DataType.DECIMAL(38, 18), allowNull: true })
  declare sourceValue: string | null;
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare sourceUnitId: number | null;
  @Column({ type: DataType.STRING(128), allowNull: true })
  declare sourceUnitText: string | null;
  @BelongsTo(() => AnalysisResult)
  analysisResult: AnalysisResult;

  @BelongsTo(() => AnalysisPoint)
  point: AnalysisPoint;

  @BelongsTo(() => AnalysisPointUnits)
  pointUnit: AnalysisPointUnits;

}
