import { Module } from '@nestjs/common';
import { GroupMembershipsService } from './group-memberships.service';
import { GroupMembershipsResolver } from './group-memberships.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GroupMembershipsResolver, GroupMembershipsService],
  exports: [GroupMembershipsService],
})
export class GroupMembershipsModule {}
