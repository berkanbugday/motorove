import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../core/storage/storage.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UsersResolver, UsersService, StorageService],
  exports: [UsersService],
})
export class UsersModule {}
