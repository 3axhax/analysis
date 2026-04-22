import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface AgesCreationAttrs {
  id?: number;
  name: string;
  intervalDayStart: number;
  intervalDayEnd: number;
}
@Table({
  tableName: 'ages',
  timestamps: false,
})
export class Age extends Model<Age, AgesCreationAttrs> {
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
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare intervalDayStart: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare intervalDayEnd: number;
}
