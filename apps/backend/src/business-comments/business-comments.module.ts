import { Module } from '@nestjs/common';
import { BusinessCommentsService } from './business-comments.service';
import { BusinessCommentsResolver } from './business-comments.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';
import { StorageModule } from 'src/core/storage/storage.module';

@Module({
  imports: [PrismaModule, AuthModule, ProfanityFilterModule, StorageModule],
  providers: [BusinessCommentsResolver, BusinessCommentsService],
  exports: [BusinessCommentsService],
})
export class BusinessCommentsModule {}
