import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { MedicalSourceAdminService } from './medical-source-admin.service';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointsUnits } from '../analysisPoint/analysisPoint-Units.model';
import { AnalysisPointUnits } from '../analysisPointUnits/analysisPointUnits.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { SourceReferenceInheritance } from './source-reference-inheritance.model';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

export interface LimitInput {
  ageId: number;
  genderId: number;
  unitId: number;
  minValue: number | null;
  maxValue: number | null;
  lowInclusive: boolean;
}
interface ConditionInput {
  pointId: number;
  status: StatusValue;
  mode: 'own' | 'inherited' | 'both';
}
interface SourcePointInput {
  sourceId: number;
  originalSourceId?: number;
  groupId: number;
  pointId: number;
  limits: LimitInput[];
  create: boolean;
}
interface SourceDescriptionInput {
  sourceId: number;
  originalSourceId?: number;
  groupId: number;
  id?: number;
  description: string;
  conditions: ConditionInput[];
}

const isId = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) > 0;
const isBound = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && Number.isFinite(value));

@Injectable()
export class MedicalSourceCrudService {
  constructor(private readonly sourceAdmin: MedicalSourceAdminService) {}

  private async scope(groupId: number) {
    return this.sourceAdmin.documentIdsForGroup(groupId);
  }
  private async document(sourceId: unknown) {
    if (!isId(sourceId))
      throw new BadRequestException('A source document is required');
    await this.sourceAdmin.assertDocument(sourceId);
    return sourceId;
  }

  async dictionaries() {
    const [points, ages, genders, units, links] = await Promise.all([
      AnalysisPoint.findAll({
        attributes: ['id', 'name', 'translationRu'],
        order: [['translationRu', 'ASC']],
      }),
      Age.findAll({
        attributes: ['id', 'name'],
        order: [['intervalDayStart', 'ASC']],
      }),
      Gender.findAll({ attributes: ['id', 'name'] }),
      AnalysisPointUnits.findAll({
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
      }),
      AnalysisPointsUnits.findAll({ attributes: ['pointId', 'unitsId'] }),
    ]);
    return { points, ages, genders, units, links };
  }

  async listPoints(groupId: number) {
    const sourceIds = await this.scope(groupId);
    if (!sourceIds.length) return [];
    const [mins, maxes, points] = await Promise.all([
      AnalysisPointMinValue.findAll({
        where: { sourceId: { [Op.in]: sourceIds } },
      }),
      AnalysisPointMaxValue.findAll({
        where: { sourceId: { [Op.in]: sourceIds } },
      }),
      AnalysisPoint.findAll({ attributes: ['id', 'name', 'translationRu'] }),
    ]);
    const pairs = new Map<
      string,
      { sourceId: number; pointId: number; name: string; limits: LimitInput[] }
    >();
    const limitKeys = new Map<string, LimitInput>();
    for (const [kind, rows] of [
      ['min', mins],
      ['max', maxes],
    ] as const) {
      for (const row of rows) {
        const sourceId = row.sourceId!;
        const pairKey = `${sourceId}:${row.pointId}`;
        if (!pairs.has(pairKey))
          pairs.set(pairKey, {
            sourceId,
            pointId: row.pointId,
            name:
              points.find((p) => p.id === row.pointId)?.translationRu ||
              points.find((p) => p.id === row.pointId)?.name ||
              String(row.pointId),
            limits: [],
          });
        const key = `${pairKey}:${row.ageId}:${row.genderId}:${row.unitId}`;
        let limit = limitKeys.get(key);
        if (!limit) {
          limit = {
            ageId: row.ageId,
            genderId: row.genderId,
            unitId: row.unitId,
            minValue: null,
            maxValue: null,
            lowInclusive: false,
          };
          pairs.get(pairKey)!.limits.push(limit);
          limitKeys.set(key, limit);
        }
        if (kind === 'min') {
          if (limit.minValue !== null)
            throw new ConflictException('Duplicate minimum bounds');
          limit.minValue = row.value;
          limit.lowInclusive = (row as AnalysisPointMinValue).lowInclusive;
        } else {
          if (limit.maxValue !== null)
            throw new ConflictException('Duplicate maximum bounds');
          limit.maxValue = row.value;
        }
      }
    }
    return [...pairs.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  async savePoint(input: SourcePointInput) {
    const sourceId = await this.document(input.sourceId);
    const originalSourceId = input.create
      ? sourceId
      : await this.document(input.originalSourceId);
    if (!isId(input.groupId))
      throw new BadRequestException('Source group required');
    const documentIds = await this.scope(input.groupId);
    if (
      !documentIds.includes(sourceId) ||
      !documentIds.includes(originalSourceId)
    )
      throw new BadRequestException('Document outside selected group');
    if (
      !isId(input.pointId) ||
      !Array.isArray(input.limits) ||
      input.limits.length === 0 ||
      typeof input.create !== 'boolean'
    )
      throw new BadRequestException('Point and bounds are required');
    const keys = new Set<string>();
    for (const limit of input.limits) {
      if (
        !isId(limit.ageId) ||
        !isId(limit.genderId) ||
        !isId(limit.unitId) ||
        !isBound(limit.minValue) ||
        !isBound(limit.maxValue) ||
        (limit.minValue === null && limit.maxValue === null) ||
        typeof limit.lowInclusive !== 'boolean' ||
        (limit.minValue !== null &&
          limit.maxValue !== null &&
          limit.minValue > limit.maxValue)
      )
        throw new BadRequestException('Invalid reference bounds');
      const key = `${limit.ageId}:${limit.genderId}:${limit.unitId}`;
      if (keys.has(key))
        throw new BadRequestException('Duplicate reference bounds');
      keys.add(key);
    }
    const sequelize = AnalysisPoint.sequelize!;
    return sequelize.transaction(async (transaction) => {
      const point = await AnalysisPoint.findByPk(input.pointId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!point) throw new BadRequestException('Unknown point');
      const existing = await Promise.all([
        AnalysisPointMinValue.count({
          where: { pointId: input.pointId, sourceId: originalSourceId },
          transaction,
        }),
        AnalysisPointMaxValue.count({
          where: { pointId: input.pointId, sourceId: originalSourceId },
          transaction,
        }),
      ]);
      if (input.create && existing.some(Boolean))
        throw new ConflictException('Reference already exists');
      if (!input.create && !existing.some(Boolean))
        throw new NotFoundException('Reference not found');
      if (sourceId !== originalSourceId) {
        const target = await Promise.all([
          AnalysisPointMinValue.count({
            where: { pointId: input.pointId, sourceId },
            transaction,
          }),
          AnalysisPointMaxValue.count({
            where: { pointId: input.pointId, sourceId },
            transaction,
          }),
        ]);
        if (target.some(Boolean))
          throw new ConflictException(
            'Reference already exists in target document',
          );
      }
      for (const limit of input.limits) {
        const [age, gender, unit] = await Promise.all([
          Age.findByPk(limit.ageId, { transaction }),
          Gender.findByPk(limit.genderId, { transaction }),
          AnalysisPointsUnits.findOne({
            where: { pointId: input.pointId, unitsId: limit.unitId },
            transaction,
          }),
        ]);
        if (!age || !gender || !unit)
          throw new BadRequestException(
            'Unknown age, gender or unavailable unit',
          );
      }
      await Promise.all([
        AnalysisPointMinValue.destroy({
          where: { pointId: input.pointId, sourceId: originalSourceId },
          transaction,
        }),
        AnalysisPointMaxValue.destroy({
          where: { pointId: input.pointId, sourceId: originalSourceId },
          transaction,
        }),
      ]);
      for (const limit of input.limits) {
        const key = {
          pointId: input.pointId,
          sourceId,
          ageId: limit.ageId,
          genderId: limit.genderId,
          unitId: limit.unitId,
        };
        if (limit.minValue !== null)
          await AnalysisPointMinValue.create(
            { ...key, value: limit.minValue, lowInclusive: limit.lowInclusive },
            { transaction },
          );
        if (limit.maxValue !== null)
          await AnalysisPointMaxValue.create(
            { ...key, value: limit.maxValue },
            { transaction },
          );
      }
      return { ok: true };
    });
  }

  async deletePoint(input: { sourceId: number; pointId: number }) {
    const sourceId = await this.document(input.sourceId);
    if (!isId(input.pointId)) throw new BadRequestException('Unknown point');
    return AnalysisPoint.sequelize!.transaction(async (transaction) => {
      await AnalysisPoint.findByPk(input.pointId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const where = { sourceId, pointId: input.pointId };
      const [a, b] = await Promise.all([
        AnalysisPointMinValue.destroy({ where, transaction }),
        AnalysisPointMaxValue.destroy({ where, transaction }),
      ]);
      if (!a && !b) throw new NotFoundException('Reference not found');
      return { ok: true };
    });
  }

  async listDescriptions(groupId: number) {
    const ids = await this.scope(groupId);
    if (!ids.length) return [];
    const [descriptions, links, ownMin, ownMax] = await Promise.all([
      AnalysisResultDescription.findAll({
        where: { sourceId: { [Op.in]: ids } },
        include: [
          {
            model: AnalysisResultDescriptionCondition,
            include: [AnalysisPoint],
          },
        ],
        order: [['id', 'ASC']],
      }),
      SourceReferenceInheritance.findAll({
        where: { sourceId: { [Op.in]: ids } },
      }),
      AnalysisPointMinValue.findAll({
        where: { sourceId: { [Op.in]: ids } },
        attributes: ['sourceId', 'pointId'],
      }),
      AnalysisPointMaxValue.findAll({
        where: { sourceId: { [Op.in]: ids } },
        attributes: ['sourceId', 'pointId'],
      }),
    ]);
    return descriptions.map((description) => {
      const plain = description.get({ plain: true });
      return {
        id: plain.id,
        sourceId: plain.sourceId,
        description: plain.description_ru,
        conditions: plain.analysisResultDescriptionConditions.map((c) => ({
          pointId: c.pointId,
          name:
            c.analysisPoint?.translationRu ||
            c.analysisPoint?.name ||
            String(c.pointId),
          status: c.status,
          mode: [...ownMin, ...ownMax].some(
            (r) => r.sourceId === plain.sourceId && r.pointId === c.pointId,
          )
            ? links.some(
                (r) => r.sourceId === plain.sourceId && r.pointId === c.pointId,
              )
              ? 'both'
              : 'own'
            : links.some(
                  (r) =>
                    r.sourceId === plain.sourceId && r.pointId === c.pointId,
                )
              ? 'inherited'
              : 'unknown',
        })),
      };
    });
  }

  async saveDescription(input: SourceDescriptionInput) {
    const sourceId = await this.document(input.sourceId);
    const originalSourceId = input.id
      ? await this.document(input.originalSourceId)
      : sourceId;
    if (!isId(input.groupId))
      throw new BadRequestException('Source group required');
    const documentIds = await this.scope(input.groupId);
    if (
      !documentIds.includes(sourceId) ||
      !documentIds.includes(originalSourceId)
    )
      throw new BadRequestException('Document outside selected group');
    if (
      typeof input.description !== 'string' ||
      !input.description.trim() ||
      !Array.isArray(input.conditions) ||
      !input.conditions.length ||
      (input.id !== undefined && !isId(input.id))
    )
      throw new BadRequestException('Description and conditions are required');
    const pointIds = new Set<number>();
    for (const condition of input.conditions) {
      if (
        !isId(condition.pointId) ||
        !Object.values(StatusValue).includes(condition.status) ||
        !['own', 'inherited', 'both'].includes(condition.mode) ||
        pointIds.has(condition.pointId)
      )
        throw new BadRequestException('Invalid condition');
      pointIds.add(condition.pointId);
    }
    return AnalysisResultDescription.sequelize!.transaction(
      async (transaction: Transaction) => {
        for (const condition of input.conditions) {
          if (
            condition.mode === 'both' &&
            !(await SourceReferenceInheritance.findOne({
              where: { sourceId, pointId: condition.pointId },
              transaction,
            }))
          )
            throw new BadRequestException('Inheritance link not found');
          const lookupSource = condition.mode === 'inherited' ? null : sourceId;
          const where = { sourceId: lookupSource, pointId: condition.pointId };
          const [minCount, maxCount] = await Promise.all([
            AnalysisPointMinValue.count({ where, transaction }),
            AnalysisPointMaxValue.count({ where, transaction }),
          ]);
          if (!minCount && !maxCount)
            throw new BadRequestException('Condition has no reference bounds');
        }
        let description: AnalysisResultDescription;
        if (input.id) {
          const existing = await AnalysisResultDescription.findOne({
            where: { id: input.id, sourceId: originalSourceId },
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (!existing)
            throw new NotFoundException('Description not found in source');
          description = existing;
          await description.update(
            { description_ru: input.description, sourceId },
            { transaction },
          );
          await AnalysisResultDescriptionCondition.destroy({
            where: { descriptionId: description.id },
            transaction,
          });
        } else {
          description = await AnalysisResultDescription.create(
            { sourceId, description_ru: input.description },
            { transaction },
          );
        }
        for (const condition of input.conditions) {
          if (condition.mode === 'inherited')
            await SourceReferenceInheritance.findOrCreate({
              where: { sourceId, pointId: condition.pointId },
              defaults: { sourceId, pointId: condition.pointId },
              transaction,
            });
          await AnalysisResultDescriptionCondition.create(
            {
              descriptionId: description.id,
              pointId: condition.pointId,
              status: condition.status,
            },
            { transaction },
          );
        }
        return { ok: true };
      },
    );
  }

  async deleteDescription(input: { sourceId: number; id: number }) {
    const sourceId = await this.document(input.sourceId);
    if (!isId(input.id)) throw new BadRequestException('Unknown description');
    return AnalysisResultDescription.sequelize!.transaction(
      async (transaction) => {
        const description = await AnalysisResultDescription.findOne({
          where: { id: input.id, sourceId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!description)
          throw new NotFoundException('Description not found in source');
        await AnalysisResultDescriptionCondition.destroy({
          where: { descriptionId: input.id },
          transaction,
        });
        await description.destroy({ transaction });
        return { ok: true };
      },
    );
  }
}
