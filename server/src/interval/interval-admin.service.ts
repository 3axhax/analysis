import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryTypes, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Interval,
  validateInterval,
  canonicalIntervalBound,
} from './interval-matcher';
import { IntervalStatus } from './interval-evaluator';
import { sourceAppliesToAge } from '../analysisResult/source-age-scope';

export interface IntervalWrite extends Interval {
  sourceId: number | null;
  status: IntervalStatus | null;
}
export interface IntervalDescriptionWrite {
  id?: number;
  sourceId: number | null;
  description_ru: string;
  conditions: { pointId: number; intervalIds: number[] }[];
}
const id = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0;

@Injectable()
export class IntervalAdminService {
  constructor(private readonly db: Sequelize) {}

  private async validateSource(
    sourceId: number | null,
    transaction: Transaction,
    ageId?: number,
  ) {
    if (sourceId === null) return;
    const sources = await this.db.query<{ metadata: Record<string, unknown> }>(
      'SELECT s.metadata FROM "medicalSource" s WHERE s.id=:sourceId AND s.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "medicalSource" child WHERE child.parent_id=s.id) FOR KEY SHARE OF s',
      { replacements: { sourceId }, transaction, type: QueryTypes.SELECT },
    );
    if (!sources.length)
      throw new BadRequestException('source_document_required');
    if (ageId !== undefined && !sourceAppliesToAge(sources[0].metadata, ageId))
      throw new BadRequestException('source_age_not_allowed');
  }

  async list(pointId: number) {
    if (!id(pointId)) throw new BadRequestException('invalid_point');
    return this.db.query(
      'SELECT id,"sourceId","pointId","ageId","genderId","unitId","minValue"::text AS "minValue","maxValue"::text AS "maxValue","minValueEqual","maxValueEqual",status FROM "analysisPointIntervalValue" WHERE "pointId"=:pointId ORDER BY id',
      { replacements: { pointId }, type: QueryTypes.SELECT },
    );
  }

  async listDescriptions() {
    return this.db.query<{
      id: number;
      sourceId: number | null;
      description_ru: string;
    }>(
      'SELECT id,"sourceId",description_ru FROM "analysisResultDescription" ORDER BY id',
      { type: QueryTypes.SELECT },
    );
  }

  async getDescription(descriptionId: number) {
    if (!id(descriptionId))
      throw new BadRequestException('invalid_description');
    const descriptions = await this.db.query<{
      id: number;
      sourceId: number | null;
      description_ru: string;
    }>(
      'SELECT id,"sourceId",description_ru FROM "analysisResultDescription" WHERE id=:descriptionId',
      { replacements: { descriptionId }, type: QueryTypes.SELECT },
    );
    if (!descriptions.length)
      throw new NotFoundException('description_not_found');
    const rows = await this.db.query<{
      conditionId: number;
      pointId: number;
      intervalId: number | null;
    }>(
      'SELECT c.id AS "conditionId",c."pointId",l."intervalId" FROM "analysisResultDescriptionCondition" c LEFT JOIN "analysisResultIntervalDescriptionCondition" l ON l."conditionId"=c.id WHERE c."descriptionId"=:descriptionId ORDER BY c.id,l."intervalId"',
      { replacements: { descriptionId }, type: QueryTypes.SELECT },
    );
    const conditions = new Map<
      number,
      { id: number; pointId: number; intervalIds: number[] }
    >();
    for (const row of rows) {
      let condition = conditions.get(row.conditionId);
      if (!condition) {
        condition = {
          id: row.conditionId,
          pointId: row.pointId,
          intervalIds: [],
        };
        conditions.set(row.conditionId, condition);
      }
      if (row.intervalId !== null) condition.intervalIds.push(row.intervalId);
    }
    return { ...descriptions[0], conditions: [...conditions.values()] };
  }

  async deleteDescription(descriptionId: number) {
    if (!id(descriptionId))
      throw new BadRequestException('invalid_description');
    return this.db.transaction(async (transaction) => {
      const found = await this.db.query<{ id: number }>(
        'SELECT id FROM "analysisResultDescription" WHERE id=:descriptionId FOR UPDATE',
        {
          replacements: { descriptionId },
          transaction,
          type: QueryTypes.SELECT,
        },
      );
      if (!found.length) throw new NotFoundException('description_not_found');
      await this.db.query(
        'DELETE FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=:descriptionId',
        { replacements: { descriptionId }, transaction },
      );
      await this.db.query(
        'DELETE FROM "analysisResultDescription" WHERE id=:descriptionId',
        { replacements: { descriptionId }, transaction },
      );
      return { deleted: true };
    });
  }

  async save(input: IntervalWrite, create: boolean) {
    if (
      !input ||
      typeof create !== 'boolean' ||
      (!create && !id(input.id)) ||
      ![input.pointId, input.ageId, input.genderId, input.unitId].every(id) ||
      (input.sourceId !== null && !id(input.sourceId)) ||
      (input.status !== null &&
        !['LOW', 'NORMAL', 'HIGH', 'OPTIMUM'].includes(input.status))
    )
      throw new BadRequestException('invalid_interval');
    try {
      validateInterval(input);
    } catch {
      throw new BadRequestException('invalid_interval');
    }
    return this.db.transaction(async (transaction) => {
      await this.validateSource(input.sourceId, transaction, input.ageId);
      const allowed = await this.db.query<{ id: number }>(
        'SELECT id FROM analysis_point_units WHERE "pointId"=:pointId AND "unitsId"=:unitId FOR KEY SHARE',
        {
          replacements: { pointId: input.pointId, unitId: input.unitId },
          transaction,
          type: QueryTypes.SELECT,
        },
      );
      if (!allowed.length) throw new BadRequestException('unit_not_allowed');
      if (!create) {
        const existing = await this.db.query<{ pointId: number }>(
          'SELECT "pointId" FROM "analysisPointIntervalValue" WHERE id=:id FOR UPDATE',
          {
            replacements: { id: input.id },
            transaction,
            type: QueryTypes.SELECT,
          },
        );
        if (!existing.length) throw new NotFoundException('interval_not_found');
        if (existing[0].pointId !== input.pointId)
          throw new ConflictException('interval_point_cannot_change');
      }
      const replacements = {
        ...input,
        minValue: canonicalIntervalBound(input.minValue),
        maxValue: canonicalIntervalBound(input.maxValue),
      };
      const sql = create
        ? 'INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","ageId","genderId","unitId","minValue","maxValue","minValueEqual","maxValueEqual",status) VALUES (:sourceId,:pointId,:ageId,:genderId,:unitId,:minValue,:maxValue,:minValueEqual,:maxValueEqual,:status) RETURNING id'
        : 'UPDATE "analysisPointIntervalValue" SET "sourceId"=:sourceId,"ageId"=:ageId,"genderId"=:genderId,"unitId"=:unitId,"minValue"=:minValue,"maxValue"=:maxValue,"minValueEqual"=:minValueEqual,"maxValueEqual"=:maxValueEqual,status=:status WHERE id=:id RETURNING id';
      const [rows] = await this.db.query(sql, { replacements, transaction });
      return rows[0];
    });
  }

  async remove(intervalId: number) {
    if (!id(intervalId)) throw new BadRequestException('invalid_interval');
    return this.db.transaction(async (transaction) => {
      const intervals = await this.db.query<{ id: number }>(
        'SELECT id FROM "analysisPointIntervalValue" WHERE id=:intervalId FOR UPDATE',
        { replacements: { intervalId }, transaction, type: QueryTypes.SELECT },
      );
      if (!intervals.length) throw new NotFoundException('interval_not_found');
      const links = await this.db.query<{ present: boolean }>(
        'SELECT EXISTS (SELECT 1 FROM "analysisResultIntervalDescriptionCondition" WHERE "intervalId"=:intervalId) AS present',
        { replacements: { intervalId }, transaction, type: QueryTypes.SELECT },
      );
      if (links[0]?.present) throw new ConflictException('interval_in_use');
      await this.db.query(
        'DELETE FROM "analysisPointIntervalValue" WHERE id=:intervalId',
        { replacements: { intervalId }, transaction },
      );
      return { deleted: true };
    });
  }

  async setConditionIntervals(conditionId: number, intervalIds: number[]) {
    if (
      !id(conditionId) ||
      !Array.isArray(intervalIds) ||
      !intervalIds.length ||
      intervalIds.some((value) => !id(value)) ||
      new Set(intervalIds).size !== intervalIds.length
    )
      throw new BadRequestException('invalid_condition_intervals');
    return this.db.transaction(async (transaction) => {
      const conditions = await this.db.query<{ pointId: number }>(
        'SELECT "pointId" FROM "analysisResultDescriptionCondition" WHERE id=:conditionId FOR UPDATE',
        { replacements: { conditionId }, transaction, type: QueryTypes.SELECT },
      );
      if (!conditions.length)
        throw new NotFoundException('condition_not_found');
      const pointId = conditions[0].pointId;
      const intervals = await this.db.query<{ id: number }>(
        'SELECT id FROM "analysisPointIntervalValue" WHERE id IN (:intervalIds) AND "pointId"=:pointId FOR KEY SHARE',
        {
          replacements: { intervalIds, pointId },
          transaction,
          type: QueryTypes.SELECT,
        },
      );
      if (intervals.length !== intervalIds.length)
        throw new BadRequestException('interval_point_mismatch');
      await this.db.query(
        'DELETE FROM "analysisResultIntervalDescriptionCondition" WHERE "conditionId"=:conditionId',
        { replacements: { conditionId }, transaction },
      );
      for (const intervalId of intervalIds)
        await this.db.query(
          'INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId") VALUES (:conditionId,:intervalId,:pointId)',
          { replacements: { conditionId, intervalId, pointId }, transaction },
        );
      return { conditionId, intervalIds };
    });
  }

  /** Description and all its AND/OR conditions change together. */
  async saveDescription(input: IntervalDescriptionWrite) {
    if (
      !input ||
      (input.id !== undefined && !id(input.id)) ||
      (input.sourceId !== null && !id(input.sourceId)) ||
      typeof input.description_ru !== 'string' ||
      !input.description_ru.trim() ||
      input.description_ru.length > 100000 ||
      !Array.isArray(input.conditions) ||
      !input.conditions.length ||
      input.conditions.length > 200 ||
      input.conditions.some(
        (condition) =>
          !condition ||
          !id(condition.pointId) ||
          !Array.isArray(condition.intervalIds) ||
          !condition.intervalIds.length ||
          condition.intervalIds.length > 10000 ||
          condition.intervalIds.some((value) => !id(value)) ||
          new Set(condition.intervalIds).size !== condition.intervalIds.length,
      )
    )
      throw new BadRequestException('invalid_description_conditions');
    return this.db.transaction(async (transaction) => {
      await this.validateSource(input.sourceId, transaction);
      for (const condition of input.conditions) {
        const found = await this.db.query<{ id: number }>(
          'SELECT id FROM "analysisPointIntervalValue" WHERE "pointId"=:pointId AND id IN (:intervalIds) FOR KEY SHARE',
          {
            replacements: {
              pointId: condition.pointId,
              intervalIds: condition.intervalIds,
            },
            transaction,
            type: QueryTypes.SELECT,
          },
        );
        if (found.length !== condition.intervalIds.length)
          throw new BadRequestException('interval_point_mismatch');
      }
      let descriptionId = input.id;
      if (descriptionId !== undefined) {
        const existing = await this.db.query<{ id: number }>(
          'SELECT id FROM "analysisResultDescription" WHERE id=:descriptionId FOR UPDATE',
          {
            replacements: { descriptionId },
            transaction,
            type: QueryTypes.SELECT,
          },
        );
        if (!existing.length)
          throw new NotFoundException('description_not_found');
        await this.db.query(
          'UPDATE "analysisResultDescription" SET "description_ru"=:text,"sourceId"=:sourceId,"updatedAt"=NOW() WHERE id=:descriptionId',
          {
            replacements: {
              descriptionId,
              text: input.description_ru,
              sourceId: input.sourceId,
            },
            transaction,
          },
        );
        await this.db.query(
          'DELETE FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=:descriptionId',
          { replacements: { descriptionId }, transaction },
        );
      } else {
        const rows = await this.db.query<{ id: number }>(
          'INSERT INTO "analysisResultDescription" ("description_ru","sourceId","createdAt","updatedAt") VALUES (:text,:sourceId,NOW(),NOW()) RETURNING id',
          {
            replacements: {
              text: input.description_ru,
              sourceId: input.sourceId,
            },
            transaction,
            type: QueryTypes.SELECT,
          },
        );
        descriptionId = rows[0].id;
      }
      for (const condition of input.conditions) {
        const rows = await this.db.query<{ id: number }>(
          'INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId") VALUES (:descriptionId,:pointId) RETURNING id',
          {
            replacements: { descriptionId, pointId: condition.pointId },
            transaction,
            type: QueryTypes.SELECT,
          },
        );
        const conditionId = rows[0].id;
        for (const intervalId of condition.intervalIds)
          await this.db.query(
            'INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId") VALUES (:conditionId,:intervalId,:pointId)',
            {
              replacements: {
                conditionId,
                intervalId,
                pointId: condition.pointId,
              },
              transaction,
            },
          );
      }
      return { id: descriptionId };
    });
  }
}
