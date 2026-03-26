import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisTypePoint } from '../analysisPoint/analysisType-Point.model';

export interface AnalysisTypeCreationAttrs {
  name: string;
  id?: number;
}
@Table({
  tableName: 'analysisType',
  timestamps: false,
})
export class AnalysisType extends Model<
  AnalysisType,
  AnalysisTypeCreationAttrs
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

  @BelongsToMany(() => AnalysisPoint, () => AnalysisTypePoint)
  analysisPoint: AnalysisPoint[];
}
