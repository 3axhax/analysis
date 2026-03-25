import {
  AfterSync,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { analysisPointInitialData } from './analysisPoint.initialData';
import { AnalysisPointsUnits } from './analysisPoint-Units.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

export interface AnalysisPointCreationAttrs {
  name: string;
  id?: number;
  translationRu?: string;
  translationEn?: string;
  translationParsing?: string;
}

@Table({
  tableName: 'analysisPoint',
  timestamps: false,
})
export class AnalysisPoint extends Model<
  AnalysisPoint,
  AnalysisPointCreationAttrs
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

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
  })
  declare translationRu: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
  })
  declare translationEn: string;

  @Column({
    type: DataType.TEXT,
    unique: true,
    allowNull: false,
  })
  declare translationParsing: string;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await AnalysisPoint.count();
      if (count === 0) {
        await AnalysisPoint.bulkCreate(analysisPointInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in AnalysisPoint.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisPoint.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisPoint.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisPoint.sequelize.query(
            `SELECT setval('"analysisPoint_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }

  @BelongsToMany(() => AnalysisPointUnits, () => AnalysisPointsUnits)
  declare units: AnalysisPointUnits[];

  async removeAllUnits(): Promise<void> {
    await AnalysisPointsUnits.destroy({
      where: {
        pointId: this.id,
      },
    });
  }

  async addUnits(unitsIds: number[]): Promise<void> {
    const records = unitsIds.map((unitsId) => ({
      pointId: this.id,
      unitsId,
    }));

    await AnalysisPointsUnits.bulkCreate(records, {
      ignoreDuplicates: true,
    });
  }
}
