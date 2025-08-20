import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../core/storage/storage.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PostsResolver, PostsService, StorageService],
  exports: [PostsService],
})
export class PostsModule {}
