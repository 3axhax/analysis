import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface AnalysisPointUnitsCreationAttrs {
  name: string;
  id?: number;
  code?: string | null;
  translationParsing?: string;
  quantityKind?: string | null;
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

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare code: string | null;

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: '' })
  declare translationParsing: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare quantityKind: string | null;
}
