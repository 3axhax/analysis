import {
  AfterSync,
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/users-roles.model';
import { userInitialData } from './users.initialData';

export interface UserCreationAttrs {
  email: string;
  name?: string;
  password: string;
}
@Table({
  tableName: 'users',
})
export class User extends Model<User, UserCreationAttrs> {
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
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
  })
  declare name: string;

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];

  @AfterSync
  static async addInitialData() {
    const count = await User.count();
    if (count === 0) {
      await User.bulkCreate(userInitialData);
    }
  }
}
