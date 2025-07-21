import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';
import { StorageService } from '../core/storage/storage.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, AuthResolver, StorageService],
  exports: [AuthService, SupabaseService],
})
export class AuthModule {}
