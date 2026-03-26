import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface GenderAttrs {
  name: string;
  id?: number;
}
@Table({
  tableName: 'gender',
  timestamps: false,
})
export class Gender extends Model<Gender, GenderAttrs> {
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
  })
  declare name: string;
}
