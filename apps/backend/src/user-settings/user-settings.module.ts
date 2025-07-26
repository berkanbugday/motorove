import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsResolver } from './user-settings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserSettingsResolver, UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
