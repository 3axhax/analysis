import {
  AfterSync,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { analysisResultDescriptionInitialData } from './analysisResultDescription.initialData';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';

export interface AnalysisResultDescriptionAttrs {
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

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description_ru: string;

  @HasMany(() => AnalysisResultDescriptionCondition)
  analysisResultDescriptionConditions: AnalysisResultDescriptionCondition[];

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisResultDescription.count();
    if (count === 0) {
      await AnalysisResultDescription.bulkCreate(
        analysisResultDescriptionInitialData,
      );
    }
  }
}
