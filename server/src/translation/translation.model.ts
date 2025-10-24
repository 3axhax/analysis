import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { translationInitialData } from './translation.initialData';
import { LangValue } from '../gender/lang-value.enum';

export interface TranslationCreationAttrs {
  id?: number;
  lang: LangValue;
  namespace: string;
  module: string;
  submodule: string | null;
  value: string;
}
@Table({
  tableName: 'translation',
  timestamps: false,
})
export class Translation extends Model<Translation, TranslationCreationAttrs> {
  @Column({
    type: DataType.ENUM(...Object.values(LangValue)),
    allowNull: false,
  })
  declare lang: LangValue;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare namespace: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare module: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare submodule: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare value: string;

  @AfterSync
  static async addInitialData() {
    try {
      const count = await Translation.count();
      if (count === 0) {
        await Translation.bulkCreate(translationInitialData);
      }
      await this.updateSequence();
    } catch (error) {
      console.error('Error in Translation.addInitialData:', error);
    }
  }

  private static async updateSequence(): Promise<void> {
    try {
      if (!Translation.sequelize) {
        console.warn('Sequelize instance is not available');
        return;
      }

      const maxId = await Translation.max('id');

      if (maxId !== null && maxId !== undefined) {
        const maxIdNumber = Number(maxId);
        if (!isNaN(maxIdNumber)) {
          await Translation.sequelize.query(
            `SELECT setval('"translation_id_seq"', ${maxIdNumber}, true)`,
          );
          console.log(`Sequence updated to ${maxIdNumber}`);
        }
      }
    } catch (error) {
      console.error('Error updating sequence:', error);
    }
  }
}
