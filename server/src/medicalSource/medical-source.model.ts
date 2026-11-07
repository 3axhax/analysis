import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface MedicalSourceAttrs {
  id?: number;
  parentId: number | null;
  name: string;
  metadata: Record<string, unknown>;
}

@Table({ tableName: 'medicalSource', timestamps: false })
export class MedicalSource extends Model<MedicalSource, MedicalSourceAttrs> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: true, field: 'parent_id' })
  declare parentId: number | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare name: string;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare metadata: Record<string, unknown>;
}
