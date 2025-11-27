import { Module } from '@nestjs/common';
import { UserBlocksService } from './user-blocks.service';
import { UserBlocksResolver } from './user-blocks.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserBlocksService, UserBlocksResolver],
  exports: [UserBlocksService],
})
export class UserBlocksModule {}
