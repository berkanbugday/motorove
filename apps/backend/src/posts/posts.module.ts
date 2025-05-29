import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../core/storage/storage.module';

@Module({
  imports: [PrismaModule, CommentsModule, AuthModule, StorageModule],
  providers: [PostsResolver, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
