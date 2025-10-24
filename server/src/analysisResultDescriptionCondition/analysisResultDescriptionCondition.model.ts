import {
  AfterSync,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { analysisResultDescriptionConditionInitialData } from './analysisResultDescriptionCondition.initialData';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { StatusValue } from './status-value.enum';

export interface AnalysisResultDescriptionConditionAttrs {
  id?: number;
  descriptionId: number;
  pointId: number;
  status: StatusValue;
}
@Table({
  tableName: 'analysisResultDescriptionCondition',
  timestamps: false,
})
export class AnalysisResultDescriptionCondition extends Model<
  AnalysisResultDescriptionCondition,
  AnalysisResultDescriptionConditionAttrs
> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => AnalysisResultDescription)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare descriptionId: number;

  @ForeignKey(() => AnalysisPoint)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare pointId: number;

  @Column({
    type: DataType.ENUM(...Object.values(StatusValue)),
    allowNull: false,
  })
  declare status: StatusValue;

  @BelongsTo(() => AnalysisResultDescription)
  description: AnalysisResultDescription;

  @BelongsTo(() => AnalysisPoint)
  analysisPoint: AnalysisPoint;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await AnalysisResultDescriptionCondition.count();
      if (count === 0) {
        await AnalysisResultDescriptionCondition.bulkCreate(
          analysisResultDescriptionConditionInitialData,
        );
      }
      await this.updateSequence();
    } catch (error) {
      console.error(
        'Error in AnalysisResultDescriptionCondition.addInitialData:',
        error,
      );
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!AnalysisResultDescriptionCondition.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await AnalysisResultDescriptionCondition.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await AnalysisResultDescriptionCondition.sequelize.query(
            `SELECT setval('"analysisResultDescriptionCondition_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
