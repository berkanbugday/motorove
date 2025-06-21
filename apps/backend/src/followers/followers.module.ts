import { Module } from '@nestjs/common';
import { FollowersResolver } from './followers.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { FollowersService } from './followers.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FollowersResolver, FollowersService],
  exports: [FollowersService],
})
export class FollowersModule {}
