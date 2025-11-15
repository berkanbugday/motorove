import { Module } from '@nestjs/common';
import { ImageCensorFilterService } from './image-censor-filter.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [ImageCensorFilterService],
  exports: [ImageCensorFilterService],
})
export class ImageCensorFilterModule {}
