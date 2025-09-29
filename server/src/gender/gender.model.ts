import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { genderInitialData } from './gender.initialData';

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
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @AfterSync
  static async addInitialData() {
    const count = await Gender.count();
    if (count === 0) {
      await Gender.bulkCreate(genderInitialData);
    }
  }
}
