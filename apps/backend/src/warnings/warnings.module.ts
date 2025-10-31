import { Module } from '@nestjs/common';
import { WarningsService } from './warnings.service';
import { WarningsResolver } from './warnings.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';

@Module({
  imports: [PrismaModule, AuthModule, ProfanityFilterModule],
  providers: [WarningsResolver, WarningsService],
  exports: [WarningsService],
})
export class WarningsModule {}
