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
    const count = await Translation.count();
    if (count === 0) {
      await Translation.bulkCreate(translationInitialData);
    }
  }
}
