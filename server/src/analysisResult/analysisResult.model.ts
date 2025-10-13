import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';
import { AnalysisResultPointData } from '../analysisResultPointData/analysisResultPointData.model';
import { User } from '../users/users.model';

export interface AnalysisResultAttrs {
  resultId: string;
  ageId: number;
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

  @ForeignKey(() => Age)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare ageId: number;

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

  @BelongsTo(() => Age)
  Age: Age;

  @BelongsTo(() => Gender)
  Gender: Gender;
}
