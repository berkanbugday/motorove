import { Module } from '@nestjs/common';
import { UserFollowingsResolver } from './user-followings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { UserFollowingsService } from './user-followings.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserFollowingsResolver, UserFollowingsService],
  exports: [UserFollowingsService],
})
export class UserFollowingsModule {}
