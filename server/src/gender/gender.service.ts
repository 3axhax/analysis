import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Gender } from './gender.model';

@Injectable()
export class GenderService {
  constructor(
    @InjectModel(Gender)
    private genderRepository: typeof Gender,
  ) {}
  async getAll(): Promise<Gender[] | null> {
    return this.genderRepository.findAll({
      include: { all: true },
    });
  }

  async getGenderByName(name: string): Promise<Gender | null> {
    return this.genderRepository.findOne({
      where: { name },
    });
  }
}
