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
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

export interface AnalysisResultPointDataAttrs {
  resultId: number;
  pointId: number;
  value: number;
  unitId: number;
  minValue?: number;
  maxValue?: number;
  sourceValue?: string | null;
  sourceUnitId?: number | null;
  sourceUnitText?: string | null;
  calculationValue?: string | null;
  conversionRuleId?: number | null;
  conversionRuleVersion?: number | null;
  appliedCoefficient?: string | null;
  referenceMin?: string | null;
  referenceMax?: string | null;
}
@Table({
  tableName: 'analysisResultPointData',
  timestamps: false,
})
export class AnalysisResultPointData extends Model<
  AnalysisResultPointData,
  AnalysisResultPointDataAttrs
> {
  _minValue: number;
  _maxValue: number;
  _status: StatusValue;

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
  @Column({ type: DataType.DECIMAL(76, 36), allowNull: true })
  declare calculationValue: string | null;
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare conversionRuleId: number | null;
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare conversionRuleVersion: number | null;
  @Column({ type: DataType.DECIMAL(38, 18), allowNull: true })
  declare appliedCoefficient: string | null;
  @Column({ type: DataType.DECIMAL(38, 18), allowNull: true })
  declare referenceMin: string | null;
  @Column({ type: DataType.DECIMAL(38, 18), allowNull: true })
  declare referenceMax: string | null;

  @BelongsTo(() => AnalysisResult)
  analysisResult: AnalysisResult;

  @BelongsTo(() => AnalysisPoint)
  point: AnalysisPoint;

  @BelongsTo(() => AnalysisPointUnits)
  pointUnit: AnalysisPointUnits;

  get minValue(): number {
    return this._minValue;
  }

  set minValue(value: number) {
    this._minValue = value;
  }
  get maxValue(): number {
    return this._maxValue;
  }

  set maxValue(value: number) {
    this._maxValue = value;
  }

  set pointDataStatus(value: StatusValue) {
    this._status = value;
  }

  get pointDataStatus(): StatusValue {
    return this._status;
  }
}
