import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';

export interface AnalysisResultDescriptionAttrs {
  sourceId?: number | null;
  id?: number;
  description_ru: string;
}
@Table({
  tableName: 'analysisResultDescription',
})
export class AnalysisResultDescription extends Model<
  AnalysisResultDescription,
  AnalysisResultDescriptionAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare sourceId: number | null;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description_ru: string;

  @HasMany(() => AnalysisResultDescriptionCondition)
  analysisResultDescriptionConditions: AnalysisResultDescriptionCondition[];
}
