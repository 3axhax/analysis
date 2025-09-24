import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { analysisPointInitialData } from './analysisPoint.initialData';

const TEST_TYPES = ['BLOOD_TEST', 'URINE_TEST', 'STOOL_TEST'] as const;

type TestType = (typeof TEST_TYPES)[number];

export interface AnalysisPointCreationAttrs {
  name: string;
  description: string;
  testType: TestType;
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

  @Column({
    type: DataType.ENUM(...TEST_TYPES),
    allowNull: false,
  })
  declare testType: TestType;

  @AfterSync
  static async addInitialData() {
    const count = await AnalysisPoint.count();
    if (count === 0) {
      await AnalysisPoint.bulkCreate(analysisPointInitialData);
      console.log('Initial age data added');
    }
  }
}
