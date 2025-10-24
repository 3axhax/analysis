import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisPoint } from './analysisPoint.model';
import { analysisPointsUnitsInitialData } from './analysisPoint-Units.initialData';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

export interface AnalysisPointsUnitsCreationAttrs {
  pointId: number;
  unitsId: number;
}
@Table({
  tableName: 'analysis_point_units',
  timestamps: false,
})
export class AnalysisPointsUnits extends Model<
  AnalysisPointsUnits,
  AnalysisPointsUnitsCreationAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @ForeignKey(() => AnalysisPointUnits)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare unitsId: number;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await AnalysisPointsUnits.count();
      if (count === 0) {
        await AnalysisPointsUnits.bulkCreate(analysisPointsUnitsInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in AnalysisPointsUnits.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisPointsUnits.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisPointsUnits.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisPointsUnits.sequelize.query(
            `SELECT setval('"analysis_point_units_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
