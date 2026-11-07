import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface SourceReferenceInheritanceAttrs {
  sourceId: number;
  pointId: number;
}

@Table({ tableName: 'sourceReferenceInheritance', timestamps: false })
export class SourceReferenceInheritance extends Model<
  SourceReferenceInheritance,
  SourceReferenceInheritanceAttrs
> {
  @Column({ type: DataType.INTEGER, primaryKey: true })
  declare sourceId: number;

  @Column({ type: DataType.INTEGER, primaryKey: true })
  declare pointId: number;
}
