import { Module } from '@nestjs/common';
import { SupportsResolver } from './supports.resolver';
import { SupportsService } from './supports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [SupportsResolver, SupportsService],
  exports: [SupportsService],
})
export class SupportsModule {}
