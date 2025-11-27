import { Module } from '@nestjs/common';
import { ContentReportsService } from './content-reports.service';
import { ContentReportsResolver } from './content-reports.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ContentReportsService, ContentReportsResolver],
  exports: [ContentReportsService],
})
export class ContentReportsModule {}
