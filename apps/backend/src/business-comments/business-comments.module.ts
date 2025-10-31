import { Module } from '@nestjs/common';
import { BusinessCommentsService } from './business-comments.service';
import { BusinessCommentsResolver } from './business-comments.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';

@Module({
  imports: [PrismaModule, AuthModule, ProfanityFilterModule],
  providers: [BusinessCommentsResolver, BusinessCommentsService],
  exports: [BusinessCommentsService],
})
export class BusinessCommentsModule {}
