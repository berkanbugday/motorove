import { Module } from '@nestjs/common';
import { GroupTagsService } from './group-tags.service';
import { GroupTagsResolver } from './group-tags.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GroupTagsService, GroupTagsResolver],
  exports: [GroupTagsService],
})
export class GroupTagsModule {}
