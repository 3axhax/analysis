import { Module } from '@nestjs/common';
import { TranslationController } from './translation.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Translation } from './translation.model';
import { TranslationService } from './translation.service';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { UsersSessions } from '../users/usersSessions/usersSessions.model';
import { User } from '../users/users.model';
import { Role } from '../roles/roles.model';

@Module({
  providers: [
    TranslationService,
    UsersSessionsService,
    UsersService,
    RolesService,
  ],
  controllers: [TranslationController],
  imports: [
    SequelizeModule.forFeature([Translation, UsersSessions, User, Role]),
  ],
  exports: [TranslationService],
})
export class TranslationModule {}
