import { Module } from '@nestjs/common';
import { ImageCensorFilterService } from './image-censor-filter.service';

@Module({
  providers: [ImageCensorFilterService],
  exports: [ImageCensorFilterService],
})
export class ImageCensorFilterModule {}
