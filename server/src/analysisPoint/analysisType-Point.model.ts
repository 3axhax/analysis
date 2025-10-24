import { AnalysisType } from '../analysisType/analysisType.model';
import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AnalysisPoint } from './analysisPoint.model';
import { analysisTypePointInitialData } from './analysisType-Point.initialData';

export interface AnalysisTypePointCreationAttrs {
  typeId: number;
  pointId: number;
}
@Table({
  tableName: 'analysis_type_point',
  createdAt: false,
  updatedAt: false,
})
export class AnalysisTypePoint extends Model<
  AnalysisTypePoint,
  AnalysisTypePointCreationAttrs
> {
  @ForeignKey(() => AnalysisType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare typeId: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await AnalysisTypePoint.count();
      if (count === 0) {
        await AnalysisTypePoint.bulkCreate(analysisTypePointInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in AnalysisTypePoint.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisTypePoint.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisTypePoint.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisTypePoint.sequelize.query(
            `SELECT setval('"analysis_type_point_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
