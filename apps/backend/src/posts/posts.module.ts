import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../core/storage/storage.service';

@Module({
  imports: [PrismaModule, CommentsModule, AuthModule],
  providers: [PostsResolver, PostsService, StorageService],
  exports: [PostsService],
})
export class PostsModule {}
