import { Module } from '@nestjs/common';
import { PostCommentsService } from './post-comments.service';
import { PostCommentsResolver } from './post-comments.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../core/queue/queue.module';

@Module({
  imports: [PrismaModule, AuthModule, QueueModule],
  providers: [PostCommentsResolver, PostCommentsService],
  exports: [PostCommentsService],
})
export class PostCommentsModule {}
