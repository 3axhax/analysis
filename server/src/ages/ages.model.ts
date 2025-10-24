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

  @AfterSync
  static async addInitialData() {
    try {
      const count = await Age.count();
      if (count === 0) {
        await Age.bulkCreate(agesInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in Age.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!Age.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await Age.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await Age.sequelize.query(
            `SELECT setval('"ages_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
