import { Module } from '@nestjs/common';
import { GroupMembershipsService } from './group-memberships.service';
import { GroupMembershipsResolver } from './group-memberships.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageService } from '../core/storage/storage.service';
@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  providers: [
    GroupMembershipsResolver,
    GroupMembershipsService,
    StorageService,
  ],
  exports: [GroupMembershipsService],
})
export class GroupMembershipsModule {}
