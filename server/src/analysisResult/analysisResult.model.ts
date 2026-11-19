import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Gender } from '../gender/gender.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { User } from '../users/users.model';

export interface AnalysisResultAttrs {
  resultId: string;
  ageInDays: number;
  genderId: number;
  userId?: number | null;
}
@Table({
  tableName: 'analysisResult',
})
export class AnalysisResult extends Model<AnalysisResult, AnalysisResultAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare resultId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare ageInDays: number;

  @ForeignKey(() => Gender)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare genderId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare userId: number;

  @HasMany(() => AnalysisResultPointData)
  analysisResultPointData: AnalysisResultPointData[];

  @BelongsTo(() => Gender)
  Gender: Gender;
}
