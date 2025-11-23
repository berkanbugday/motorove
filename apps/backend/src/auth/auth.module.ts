import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, AuthResolver],
  exports: [AuthService, SupabaseService],
})
export class AuthModule {}
