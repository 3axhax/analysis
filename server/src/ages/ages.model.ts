import {
  AfterSync,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

interface AgesCreationAttrs {
  description: string;
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
  description: string;

  @AfterSync
  static async addInitialData() {
    const count = await Age.count();
    if (count === 0) {
      await Age.bulkCreate([
        { description: '0-1 мес.' },
        { description: '1-3 мес.' },
        { description: '3-6 мес.' },
        { description: '1-3 года' },
        { description: '3-6 лет' },
        { description: '6-9 лет' },
        { description: '9-15 лет' },
        { description: '15-18 лет' },
        { description: 'старше 18 лет' },
      ]);
      console.log('Initial age data added');
    }
  }
}
