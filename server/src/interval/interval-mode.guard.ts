import {
  CanActivate,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { intervalModeEnabled } from './interval-mode';

@Injectable()
export class IntervalEnabledGuard implements CanActivate {
  canActivate() {
    if (!intervalModeEnabled()) throw new NotFoundException();
    return true;
  }
}

/** Legacy CRUD cannot safely rewrite the old tables after interval cutover. */
@Injectable()
export class LegacyIntervalWriteGuard implements CanActivate {
  canActivate() {
    if (intervalModeEnabled())
      throw new ConflictException('legacy_interval_editor_unavailable');
    return true;
  }
}
