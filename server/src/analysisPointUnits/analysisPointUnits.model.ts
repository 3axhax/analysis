import { Column, DataType, Model, Table } from 'sequelize-typescript';

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
}
