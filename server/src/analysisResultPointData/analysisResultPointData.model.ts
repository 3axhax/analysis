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
