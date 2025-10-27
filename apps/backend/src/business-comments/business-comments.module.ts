import { Module } from '@nestjs/common';
import { BusinessCommentsService } from './business-comments.service';
import { BusinessCommentsResolver } from './business-comments.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BusinessCommentsResolver, BusinessCommentsService],
  exports: [BusinessCommentsService],
})
export class BusinessCommentsModule {}
