import { Controller, Get } from '@nestjs/common';
import { GenderService } from './gender.service';

@Controller('gender')
export class GenderController {
  constructor(private GenderService: GenderService) {}
  @Get()
  getAll() {
    return this.GenderService.getAll();
  }
}
