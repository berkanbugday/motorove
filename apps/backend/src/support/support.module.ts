import { Module } from '@nestjs/common';
import { SupportResolver } from './support.resolver';
import { SupportService } from './support.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [SupportResolver, SupportService],
  exports: [SupportService],
})
export class SupportModule {}
