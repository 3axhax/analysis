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

  @AfterSync
  static async addInitialData() {
    try {
      const count = await Gender.count();
      if (count === 0) {
        await Gender.bulkCreate(genderInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in Gender.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!Gender.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await Gender.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await Gender.sequelize.query(
            `SELECT setval('"gender_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
