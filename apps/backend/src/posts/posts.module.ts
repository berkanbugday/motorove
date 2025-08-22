import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../core/storage/storage.module';
import { ImageCensorFilterModule } from '../core/image-censor-filter/image-censor-filter.module';
import { ProfanityFilterModule } from '../core/profanity-filter/profanity-filter.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StorageModule,
    ImageCensorFilterModule,
    ProfanityFilterModule,
  ],
  providers: [PostsResolver, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
