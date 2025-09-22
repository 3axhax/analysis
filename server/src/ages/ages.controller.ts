import { Controller, Get } from '@nestjs/common';
import { AgesService } from './ages.service';

@Controller('ages')
export class AgesController {
  constructor(private AgesService: AgesService) {}
  @Get()
  getAll() {
    return this.AgesService.getAll();
  }
}
