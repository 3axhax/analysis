import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Age } from './ages.model';

@Injectable()
export class AgesService {
  constructor(
    @InjectModel(Age)
    private ageRepository: typeof Age,
  ) {}
  async getAll(): Promise<Age[] | null> {
    return this.ageRepository.findAll({
      include: { all: true },
    });
  }

  async getAgeByName(ageName: string): Promise<Age | null> {
    return this.ageRepository.findOne({
      where: { name: ageName },
    });
  }
}
