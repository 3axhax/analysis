import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersSessionsService } from './usersSessions.service';
import { UsersSessions } from './usersSessions.model';

@Module({
  providers: [UsersSessionsService],
  imports: [SequelizeModule.forFeature([UsersSessions])],
  exports: [UsersSessionsService, UsersSessionsModule],
})
export class UsersSessionsModule {}
