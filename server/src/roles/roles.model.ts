import { Column, DataType, Model, Table } from 'sequelize-typescript';

const userRoleList: string[] = ['ADMIN', 'USER'] as const;
export type userRoleType = (typeof userRoleList)[number];

export interface RoleCreationAttrs {
  id?: number;
  value: userRoleType;
}
@Table({
  tableName: 'roles',
  timestamps: false,
})
export class Role extends Model<Role, RoleCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM({
      values: userRoleList,
    }),
    unique: true,
    allowNull: false,
  })
  declare value: string;
}
