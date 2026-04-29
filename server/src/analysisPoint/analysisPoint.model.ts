import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { AnalysisPointsUnits } from './analysisPoint-Units.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';

export interface AnalysisPointCreationAttrs {
  name: string;
  id?: number;
  translationRu?: string;
  translationEn?: string;
  translationParsing?: string;
  pointHintRu?: string;
  pointHintEn?: string;
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
  })
  declare translationRu: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
  })
  declare translationEn: string;

  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  declare translationParsing: string;

  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  declare pointHintRu: string;

  @Column({
    type: DataType.TEXT,
    unique: true,
  })
  declare pointHintEn: string;

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
