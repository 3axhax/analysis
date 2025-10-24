import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { analysisPointUnitsInitialData } from './analysisPointUnits.initialData';

export interface AnalysisPointUnitsCreationAttrs {
  name: string;
  id?: number;
}

@Table({
  tableName: 'analysisPointUnits',
  timestamps: false,
})
export class AnalysisPointUnits extends Model<
  AnalysisPointUnits,
  AnalysisPointUnitsCreationAttrs
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
      const count = await AnalysisPointUnits.count();

      if (count === 0) {
        await AnalysisPointUnits.bulkCreate(analysisPointUnitsInitialData);
      }

      await this.updateSequence();
    } catch (error) {
      console.error('Error in AnalysisPointUnits.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisPointUnits.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisPointUnits.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisPointUnits.sequelize.query(
            `SELECT setval('"analysisPointUnits_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
