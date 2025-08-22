import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../core/storage/storage.module';
import { NSFWModule } from '../nsfw/nsfw.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StorageModule,
    NSFWModule,
    ProfanityFilterModule,
  ],
  providers: [PostsResolver, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
