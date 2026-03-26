import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/users-roles.model';

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
}
