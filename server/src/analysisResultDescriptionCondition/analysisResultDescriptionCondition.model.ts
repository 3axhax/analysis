import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';

export interface AnalysisResultDescriptionConditionAttrs {
  id?: number;
  descriptionId: number;
  pointId: number;
}
@Table({
  tableName: 'analysisResultDescriptionCondition',
  timestamps: false,
})
export class AnalysisResultDescriptionCondition extends Model<
  AnalysisResultDescriptionCondition,
  AnalysisResultDescriptionConditionAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => AnalysisResultDescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare descriptionId: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @BelongsTo(() => AnalysisResultDescription)
  description: AnalysisResultDescription;

  @BelongsTo(() => AnalysisPoint)
  analysisPoint: AnalysisPoint;
}
