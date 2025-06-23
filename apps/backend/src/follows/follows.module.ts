import { Module } from '@nestjs/common';
import { FollowsResolver } from './follows.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { FollowsService } from './follows.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FollowsResolver, FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
