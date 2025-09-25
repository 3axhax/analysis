import {
  AfterSync,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { analysisTypeInitialData } from './analysisType.initialData';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisTypePoint } from '../analysisPoint/analysisType-Point.model';

export interface AnalysisTypeCreationAttrs {
  name: string;
  description: string;
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
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare description: string;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisType.count();
    if (count === 0) {
      await AnalysisType.bulkCreate(analysisTypeInitialData);
      console.log('Initial Analysis Type data added');
    }
  }

  @BelongsToMany(() => AnalysisPoint, () => AnalysisTypePoint)
  analysisPoint: AnalysisPoint[];
}
