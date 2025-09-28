import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';
import { AnalysisResultPointData } from './analysisResultPointData.model';

export interface AnalysisResultAttrs {
  resultId: string;
  ageId: number;
  genderId: number;
}
@Table({
  tableName: 'analysisResult',
})
export class AnalysisResult extends Model<AnalysisResult, AnalysisResultAttrs> {
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

  @HasMany(() => AnalysisResultPointData)
  analysisResultPointData: AnalysisResultPointData[];
}
