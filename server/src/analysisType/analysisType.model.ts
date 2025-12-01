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

  @AfterSync
  static async addInitialData() {
    try {
      const count = await AnalysisType.count();
      if (count === 0) {
        await AnalysisType.bulkCreate(analysisTypeInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in AnalysisType.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisType.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisType.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisType.sequelize.query(
            `SELECT setval('"analysisType_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }

  @BelongsToMany(() => AnalysisPoint, () => AnalysisTypePoint)
  analysisPoint: AnalysisPoint[];
}
