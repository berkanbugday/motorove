import { Module } from '@nestjs/common';
import { UserFollowingsResolver } from './user-followings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { UserFollowingsService } from './user-followings.service';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../core/queue/queue.module';
import { UserBlocksModule } from '../user-blocks/user-blocks.module';

@Module({
  imports: [PrismaModule, AuthModule, QueueModule, UserBlocksModule],
  providers: [UserFollowingsResolver, UserFollowingsService],
  exports: [UserFollowingsService],
})
export class UserFollowingsModule {}
