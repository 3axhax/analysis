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
    try {
      const count = await AnalysisResultDescription.count();
      if (count === 0) {
        await AnalysisResultDescription.bulkCreate(
          analysisResultDescriptionInitialData,
        );
      }
      await this.updateSequence();
    } catch (error) {
      console.error(
        'Error in AnalysisResultDescription.addInitialData:',
        error,
      );
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisResultDescription.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisResultDescription.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisResultDescription.sequelize.query(
            `SELECT setval('"analysisResultDescription_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
