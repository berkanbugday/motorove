import { Module } from '@nestjs/common';
import { WarningsService } from './warnings.service';
import { WarningsResolver } from './warnings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [WarningsResolver, WarningsService],
  exports: [WarningsService],
})
export class WarningsModule {}
