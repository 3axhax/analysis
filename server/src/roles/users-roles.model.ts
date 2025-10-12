import {
  AfterSync,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from './roles.model';
import { User } from '../users/users.model';
import { usersRolesInitialData } from './usersRoles.initialData';

export interface UsersRolesCreationAttrs {
  roleId: number;
  userId: number;
}

@Table({
  tableName: 'users-roles',
  timestamps: false,
})
export class UserRole extends Model<UserRole, UsersRolesCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare roleId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @AfterSync
  static async addInitialData() {
    const count = await UserRole.count();
    if (count === 0) {
      await UserRole.bulkCreate(usersRolesInitialData);
    }
  }
}
