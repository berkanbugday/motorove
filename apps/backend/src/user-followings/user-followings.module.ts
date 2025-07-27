import { Module } from '@nestjs/common';
import { UserFollowingsResolver } from './user-followings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { UserFollowingsService } from './user-followings.service';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../core/storage/storage.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserFollowingsResolver, UserFollowingsService, StorageService],
  exports: [UserFollowingsService],
})
export class UserFollowingsModule {}
