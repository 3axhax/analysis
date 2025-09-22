import { Body, Controller, Get } from '@nestjs/common';
import { AgesService } from './ages.service';

@Controller('roles')
export class AgesController {
  constructor(private AgesService: AgesService) {}
  @Get('')
  getAll() {
    return this.AgesService.getAll();
  }
}
