import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { IntervalAdminService } from './interval-admin.service';
import type {
  IntervalDescriptionWrite,
  IntervalWrite,
} from './interval-admin.service';

@Controller('admin/intervals')
@Roles('ADMIN')
@UseGuards(RolesGuard)
export class IntervalAdminController {
  constructor(private readonly intervals: IntervalAdminService) {}

  @Get('point/:pointId')
  list(@Param('pointId', ParseIntPipe) pointId: number) {
    return this.intervals.list(pointId);
  }

  @Get('descriptions')
  listDescriptions() {
    return this.intervals.listDescriptions();
  }

  @Get('descriptions/:descriptionId')
  getDescription(@Param('descriptionId', ParseIntPipe) descriptionId: number) {
    return this.intervals.getDescription(descriptionId);
  }

  @Post('save')
  save(@Body() body: { interval: IntervalWrite; create: boolean }) {
    return this.intervals.save(body?.interval, body?.create);
  }

  @Post('condition')
  setConditionIntervals(
    @Body() body: { conditionId: number; intervalIds: number[] },
  ) {
    return this.intervals.setConditionIntervals(
      body?.conditionId,
      body?.intervalIds,
    );
  }

  @Post('delete')
  remove(@Body() body: { intervalId: number }) {
    return this.intervals.remove(body?.intervalId);
  }

  @Post('description/save')
  saveDescription(@Body() body: IntervalDescriptionWrite) {
    return this.intervals.saveDescription(body);
  }

  @Post('description/delete')
  deleteDescription(@Body() body: { descriptionId: number }) {
    return this.intervals.deleteDescription(body?.descriptionId);
  }
}
