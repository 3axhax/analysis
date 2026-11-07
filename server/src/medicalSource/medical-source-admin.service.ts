import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MedicalSource } from './medical-source.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { SourceReferenceInheritance } from './source-reference-inheritance.model';

@Injectable()
export class MedicalSourceAdminService {
  async listSources() {
    const sources = await MedicalSource.findAll({ order: [['name', 'ASC']] });
    return sources.map(({ id, parentId, name }) => ({ id, parentId, name }));
  }

  async documentIdsForGroup(groupId: number): Promise<number[]> {
    const sources = await this.listSources();
    const group = sources.find((source) => source.id === groupId);
    if (!group || group.parentId !== null)
      throw new BadRequestException('Unknown source group');
    const ids = new Set<number>([groupId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const source of sources) {
        if (
          source.parentId !== null &&
          ids.has(source.parentId) &&
          !ids.has(source.id)
        ) {
          ids.add(source.id);
          changed = true;
        }
      }
    }
    return sources
      .filter(
        (source) =>
          ids.has(source.id) &&
          source.id !== groupId &&
          !sources.some((child) => child.parentId === source.id),
      )
      .map((source) => source.id);
  }

  async assertDocument(sourceId: number): Promise<void> {
    const sources = await this.listSources();
    const source = sources.find((item) => item.id === sourceId);
    if (!source) throw new NotFoundException('Source document not found');
    if (
      source.parentId === null ||
      sources.some((item) => item.parentId === sourceId)
    ) {
      throw new BadRequestException('A source document is required');
    }
  }

  async pointOptions(sourceId: number) {
    await this.assertDocument(sourceId);
    const [
      sourceMins,
      sourceMaxes,
      commonMins,
      commonMaxes,
      inherited,
      points,
    ] = await Promise.all([
      AnalysisPointMinValue.findAll({
        where: { sourceId },
        attributes: ['pointId'],
      }),
      AnalysisPointMaxValue.findAll({
        where: { sourceId },
        attributes: ['pointId'],
      }),
      AnalysisPointMinValue.findAll({
        where: { sourceId: null },
        attributes: ['pointId'],
      }),
      AnalysisPointMaxValue.findAll({
        where: { sourceId: null },
        attributes: ['pointId'],
      }),
      SourceReferenceInheritance.findAll({
        where: { sourceId },
        attributes: ['pointId'],
      }),
      AnalysisPoint.findAll({
        attributes: ['id', 'name', 'translationRu'],
        order: [['translationRu', 'ASC']],
      }),
    ]);
    const ids = (rows: { pointId: number }[]) =>
      new Set(rows.map((row) => row.pointId));
    const own = ids([...sourceMins, ...sourceMaxes]);
    const common = ids([...commonMins, ...commonMaxes]);
    const links = ids(inherited);
    return points
      .filter(
        (point) =>
          own.has(point.id) || common.has(point.id) || links.has(point.id),
      )
      .map((point) => ({
        id: point.id,
        name: point.name,
        translationRu: point.translationRu,
        own: own.has(point.id),
        inheritable: common.has(point.id),
        inherited: links.has(point.id),
      }));
  }
}
