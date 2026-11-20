import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MedicalSource } from './medical-source.model';
import { Op } from 'sequelize';

@Injectable()
export class MedicalSourceAdminService {
  listAnalysisLog() {
    return MedicalSource.findAll({
      attributes: ['id', 'parentId', 'name', 'url', 'year', 'status', 'comment', 'published'],
      where: { status: { [Op.ne]: null } },
      order: [['id', 'ASC']],
    });
  }

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

}
