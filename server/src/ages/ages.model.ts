import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { agesInitialData } from './ages.initialData';

export interface AgesCreationAttrs {
  id?: number;
  name: string;
}
@Table({
  tableName: 'ages',
  timestamps: false,
})
export class Age extends Model<Age, AgesCreationAttrs> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare name: string;

  @AfterSync
  static async addInitialData() {
    const count = await Age.count();
    if (count === 0) {
      await Age.bulkCreate(agesInitialData);
    }
  }
}
