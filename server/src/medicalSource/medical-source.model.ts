import { Column, DataType, Model, Table } from 'sequelize-typescript';

export const MEDICAL_SOURCE_ANALYSIS_STATUSES = [
  'ANALYZED',
  'PARTIAL',
  'REJECTED_LICENSE',
  'REJECTED_YEAR',
] as const;

type MedicalSourceAnalysisStatus = (typeof MEDICAL_SOURCE_ANALYSIS_STATUSES)[number];

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

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare published: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare url: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare year: number | null;

  @Column({ type: DataType.ENUM(...MEDICAL_SOURCE_ANALYSIS_STATUSES), allowNull: true })
  declare status: MedicalSourceAnalysisStatus | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comment: string | null;

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: {} })
  declare metadata: Record<string, unknown>;
}
